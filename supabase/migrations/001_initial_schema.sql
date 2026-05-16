-- ============================================================
-- CRONOMAP — Migração 001: Schema Inicial
-- Autor: Dara (Data Engineer)
-- Data: 2026-05-14
-- ============================================================

-- 1. ENUMS
CREATE TYPE disciplina_enum AS ENUM (
  'ar_condicionado', 'eletrica', 'arquitetura',
  'hidraulica', 'civil_estrutural', 'drywall'
);

CREATE TYPE elemento_ac_enum AS ENUM (
  'evaporadora', 'duto_insuflamento', 'duto_ar_externo',
  'duto_exaustao', 'duto_extracao', 'grelha', 'damper',
  'difusor', 'duto_flexivel', 'dreno', 'linha_frigorifera', 'condensadora'
);

CREATE TYPE status_processamento_enum AS ENUM (
  'aguardando', 'processando', 'concluido', 'erro'
);

-- 2. TABELAS
CREATE TABLE processos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gestor_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL CHECK (char_length(nome) BETWEEN 3 AND 200),
  descricao   TEXT,
  ativo       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projetos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processo_id   UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  nome          TEXT NOT NULL CHECK (char_length(nome) BETWEEN 3 AND 200),
  disciplina    disciplina_enum NOT NULL,
  descricao     TEXT,
  ativo         BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pranchas (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id            UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  numero_folha          TEXT NOT NULL,
  titulo                TEXT,
  pdf_url               TEXT NOT NULL,
  imagem_url            TEXT,
  status_processamento  status_processamento_enum NOT NULL DEFAULT 'aguardando',
  erro_mensagem         TEXT,
  largura_px            INTEGER,
  altura_px             INTEGER,
  area_legenda          JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_prancha_por_projeto UNIQUE (projeto_id, numero_folha)
);

CREATE TABLE elementos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prancha_id      UUID NOT NULL REFERENCES pranchas(id) ON DELETE CASCADE,
  tipo            elemento_ac_enum NOT NULL,
  coordenadas     JSONB NOT NULL,
  confianca_ia    NUMERIC(4,3) CHECK (confianca_ia BETWEEN 0 AND 1),
  executado       BOOLEAN NOT NULL DEFAULT false,
  ignorado        BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE snapshots_diarios (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id            UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  data_conferencia      DATE NOT NULL,
  percentual_geral      NUMERIC(5,2) NOT NULL CHECK (percentual_geral BETWEEN 0 AND 100),
  total_elementos       INTEGER NOT NULL CHECK (total_elementos >= 0),
  elementos_executados  INTEGER NOT NULL CHECK (elementos_executados >= 0),
  observacoes           TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_snapshot_por_dia UNIQUE (projeto_id, data_conferencia),
  CONSTRAINT chk_elementos_validos CHECK (elementos_executados <= total_elementos)
);

CREATE TABLE snapshot_percentuais (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id     UUID NOT NULL REFERENCES snapshots_diarios(id) ON DELETE CASCADE,
  tipo_elemento   elemento_ac_enum NOT NULL,
  total           INTEGER NOT NULL CHECK (total >= 0),
  executados      INTEGER NOT NULL CHECK (executados >= 0),
  percentual      NUMERIC(5,2) NOT NULL CHECK (percentual BETWEEN 0 AND 100),
  CONSTRAINT uq_percentual_por_tipo UNIQUE (snapshot_id, tipo_elemento),
  CONSTRAINT chk_executados_validos CHECK (executados <= total)
);

-- 3. TRIGGER updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_processos_updated_at
  BEFORE UPDATE ON processos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_projetos_updated_at
  BEFORE UPDATE ON projetos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pranchas_updated_at
  BEFORE UPDATE ON pranchas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_elementos_updated_at
  BEFORE UPDATE ON elementos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. ROW LEVEL SECURITY
ALTER TABLE processos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE pranchas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE elementos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots_diarios  ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_percentuais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gestor acessa seus processos"
  ON processos FOR ALL USING (gestor_id = auth.uid());

CREATE POLICY "gestor acessa seus projetos"
  ON projetos FOR ALL USING (
    processo_id IN (SELECT id FROM processos WHERE gestor_id = auth.uid())
  );

CREATE POLICY "gestor acessa suas pranchas"
  ON pranchas FOR ALL USING (
    projeto_id IN (
      SELECT p.id FROM projetos p
      JOIN processos pr ON pr.id = p.processo_id
      WHERE pr.gestor_id = auth.uid()
    )
  );

CREATE POLICY "gestor acessa seus elementos"
  ON elementos FOR ALL USING (
    prancha_id IN (
      SELECT pr.id FROM pranchas pr
      JOIN projetos pj ON pj.id = pr.projeto_id
      JOIN processos pc ON pc.id = pj.processo_id
      WHERE pc.gestor_id = auth.uid()
    )
  );

CREATE POLICY "gestor acessa seus snapshots"
  ON snapshots_diarios FOR ALL USING (
    projeto_id IN (
      SELECT p.id FROM projetos p
      JOIN processos pr ON pr.id = p.processo_id
      WHERE pr.gestor_id = auth.uid()
    )
  );

CREATE POLICY "gestor acessa seus percentuais"
  ON snapshot_percentuais FOR ALL USING (
    snapshot_id IN (
      SELECT s.id FROM snapshots_diarios s
      JOIN projetos p ON p.id = s.projeto_id
      JOIN processos pr ON pr.id = p.processo_id
      WHERE pr.gestor_id = auth.uid()
    )
  );

-- 5. ÍNDICES
CREATE INDEX idx_processos_gestor_id ON processos(gestor_id);
CREATE INDEX idx_processos_ativo ON processos(gestor_id, ativo) WHERE ativo = true;
CREATE INDEX idx_projetos_processo_id ON projetos(processo_id);
CREATE INDEX idx_projetos_disciplina ON projetos(processo_id, disciplina);
CREATE INDEX idx_pranchas_projeto_id ON pranchas(projeto_id);
CREATE INDEX idx_pranchas_status ON pranchas(projeto_id, status_processamento);
CREATE INDEX idx_elementos_prancha_id ON elementos(prancha_id);
CREATE INDEX idx_elementos_tipo ON elementos(prancha_id, tipo);
CREATE INDEX idx_elementos_executado ON elementos(prancha_id, executado);
CREATE INDEX idx_snapshots_data ON snapshots_diarios(projeto_id, data_conferencia DESC);
CREATE INDEX idx_snapshot_percentuais_snapshot_id ON snapshot_percentuais(snapshot_id);
