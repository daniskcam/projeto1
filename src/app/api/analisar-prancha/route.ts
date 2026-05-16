import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/utils/supabase/server'

const PROMPTS: Record<string, string> = {
  ar_condicionado: `Você é um especialista em instalações de HVAC e ar condicionado.
Analise esta planta técnica e identifique todos os elementos de ar condicionado presentes.

Para cada elemento encontrado, determine:
- tipo: use EXATAMENTE um destes valores (sem variações):
  evaporadora, duto_insuflamento, duto_ar_externo, duto_exaustao, duto_extracao,
  grelha, damper, difusor, duto_flexivel, dreno, linha_frigorifera, condensadora
- coordenadas: posição relativa na planta (x e y de 0 a 1 a partir do canto superior esquerdo; largura e altura de 0 a 1)
- confianca: sua confiança na identificação, de 0 a 1

Seja abrangente — identifique TODOS os elementos visíveis, mesmo os menores.
Retorne SOMENTE JSON válido, sem texto adicional, sem markdown:
{"elementos": [{"tipo": "grelha", "coordenadas": {"x": 0.2, "y": 0.3, "largura": 0.04, "altura": 0.03}, "confianca": 0.92}]}`,
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey || apiKey === 'sua_anthropic_api_key_aqui') {
      return NextResponse.json(
        { erro: 'ANTHROPIC_API_KEY não configurada. Adicione sua chave no arquivo .env.local e reinicie o servidor.' },
        { status: 500 }
      )
    }

    const { pranchaId } = await request.json()
    if (!pranchaId) {
      return NextResponse.json({ erro: 'pranchaId não informado' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

    // Buscar prancha com a disciplina do projeto
    const { data: prancha } = await supabase
      .from('pranchas')
      .select('*, projetos!inner(disciplina)')
      .eq('id', pranchaId)
      .single()

    if (!prancha) return NextResponse.json({ erro: 'Prancha não encontrada' }, { status: 404 })

    const disciplina = (prancha.projetos as { disciplina: string }).disciplina

    if (!PROMPTS[disciplina]) {
      return NextResponse.json(
        { erro: `Análise por IA ainda não disponível para a disciplina "${disciplina}". Disponível: ar_condicionado.` },
        { status: 400 }
      )
    }

    // Marcar como processando
    await supabase
      .from('pranchas')
      .update({ status_processamento: 'processando', erro_mensagem: null })
      .eq('id', pranchaId)

    // Extrair caminho do arquivo da URL armazenada
    const urlParts = prancha.pdf_url.split('/pranchas/')
    const filePath = urlParts[1]?.split('?')[0]

    if (!filePath) {
      await supabase.from('pranchas')
        .update({ status_processamento: 'erro', erro_mensagem: 'Caminho do arquivo inválido na URL armazenada.' })
        .eq('id', pranchaId)
      return NextResponse.json({ erro: 'Caminho do arquivo inválido' }, { status: 400 })
    }

    // Baixar PDF do Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('pranchas')
      .download(filePath)

    if (downloadError || !fileData) {
      const msg = downloadError?.message ?? 'Falha ao baixar o arquivo'
      await supabase.from('pranchas')
        .update({ status_processamento: 'erro', erro_mensagem: msg })
        .eq('id', pranchaId)
      return NextResponse.json({ erro: msg }, { status: 500 })
    }

    // Converter para base64
    const arrayBuffer = await fileData.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    // Chamar Claude com o PDF
    const anthropic = new Anthropic({ apiKey })

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 8096,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64,
            },
          } as Parameters<typeof anthropic.messages.create>[0]['messages'][0]['content'][0],
          {
            type: 'text',
            text: PROMPTS[disciplina],
          },
        ],
      }],
    })

    const texto = response.content[0].type === 'text' ? response.content[0].text : ''

    // Extrair JSON da resposta
    const jsonMatch = texto.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      await supabase.from('pranchas')
        .update({ status_processamento: 'erro', erro_mensagem: 'A IA não retornou um resultado válido.' })
        .eq('id', pranchaId)
      return NextResponse.json({ erro: 'Resposta inválida da IA' }, { status: 500 })
    }

    const { elementos } = JSON.parse(jsonMatch[0]) as {
      elementos: Array<{ tipo: string; coordenadas: object; confianca: number }>
    }

    // Remover elementos anteriores (re-análise)
    await supabase.from('elementos').delete().eq('prancha_id', pranchaId)

    // Inserir novos elementos
    if (elementos && elementos.length > 0) {
      await supabase.from('elementos').insert(
        elementos.map((el) => ({
          prancha_id: pranchaId,
          tipo: el.tipo,
          coordenadas: el.coordenadas,
          confianca_ia: Math.min(1, Math.max(0, Number(el.confianca) || 0)),
          executado: false,
          ignorado: false,
        }))
      )
    }

    // Marcar como concluído
    await supabase.from('pranchas')
      .update({ status_processamento: 'concluido', erro_mensagem: null })
      .eq('id', pranchaId)

    return NextResponse.json({ sucesso: true, totalElementos: elementos?.length ?? 0 })

  } catch (error) {
    console.error('[analisar-prancha]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor.' }, { status: 500 })
  }
}
