CREATE TYPE niche_status AS ENUM ('ACTIVE', 'PARKED');
CREATE TYPE keyword_status AS ENUM ('IMPORTED', 'ANALYZED', 'SCORED', 'PARKED', 'REJECTED');
CREATE TYPE import_batch_status AS ENUM ('PENDING', 'COMPLETE', 'PARTIAL', 'FAILED');
CREATE TYPE import_row_status AS ENUM ('ACCEPTED', 'REJECTED', 'DUPLICATE');
CREATE TYPE source_type AS ENUM ('MEASURED', 'HYPOTHESIS', 'DERIVED', 'MANUAL', 'UNAVAILABLE');
CREATE TYPE value_status AS ENUM ('PRESENT', 'UNAVAILABLE', 'CONTRADICTED', 'STALE');
CREATE TYPE facet_kind AS ENUM ('PRODUCT', 'USER', 'PROBLEM', 'ENVIRONMENT', 'USE_CASE', 'CONSTRAINT', 'ATTRIBUTE');
CREATE TYPE intent_type AS ENUM ('COMMERCIAL_INVESTIGATION', 'TRANSACTIONAL', 'INFORMATIONAL', 'MIXED', 'UNKNOWN');
CREATE TYPE pattern_type AS ENUM ('BEST_X_FOR_Y', 'BEST_ATTRIBUTE_X', 'X_VS_Y', 'BEST_X_UNDER_PRICE', 'HOW_TO_CHOOSE_X', 'BUYING_GUIDE', 'OTHER');
CREATE TYPE score_band AS ENUM ('PROVISIONAL_HIGH', 'PROVISIONAL_MEDIUM', 'PROVISIONAL_LOW', 'INSUFFICIENT_DATA');
CREATE TYPE agent_run_status AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'INVALID_OUTPUT', 'FABRICATED_NUMERIC', 'FABRICATED_EXPERIENCE', 'BUDGET_EXCEEDED', 'FAILED', 'CACHED');

CREATE TABLE niche (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  status niche_status NOT NULL,
  market text NOT NULL,
  language text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX niche_market_language_idx ON niche (market, language);

CREATE TABLE niche_alias (
  id uuid PRIMARY KEY,
  niche_id uuid NOT NULL REFERENCES niche(id),
  alias text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE import_batch (
  id uuid PRIMARY KEY,
  source_path text NOT NULL,
  file_sha256 text NOT NULL,
  importer_version text NOT NULL,
  row_count integer NOT NULL,
  accepted_count integer NOT NULL DEFAULT 0,
  rejected_count integer NOT NULL DEFAULT 0,
  status import_batch_status NOT NULL,
  actor text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT import_batch_file_version_uq UNIQUE (file_sha256, importer_version)
);

CREATE TABLE agent_prompt (
  id uuid PRIMARY KEY,
  agent_id text NOT NULL,
  name text NOT NULL,
  version text NOT NULL,
  content_hash text NOT NULL,
  content text NOT NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT agent_prompt_identity_uq UNIQUE (agent_id, name, version)
);

CREATE TABLE agent_run (
  id uuid PRIMARY KEY,
  agent_id text NOT NULL,
  agent_version text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  status agent_run_status NOT NULL,
  input_hash text NOT NULL,
  input_json jsonb NOT NULL,
  output_json jsonb,
  error_code text,
  error_message text,
  model text NOT NULL,
  provider text NOT NULL,
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  estimated_cost_usd numeric(12,6) NOT NULL CHECK (estimated_cost_usd >= 0),
  duration_ms integer NOT NULL,
  started_at timestamptz NOT NULL,
  finished_at timestamptz,
  parent_run_id uuid,
  trace_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE keyword (
  id uuid PRIMARY KEY,
  niche_id uuid NOT NULL REFERENCES niche(id),
  raw_text text NOT NULL,
  canonical_text text NOT NULL,
  canonical_hash text NOT NULL UNIQUE,
  locale text NOT NULL,
  market text NOT NULL,
  status keyword_status NOT NULL,
  first_seen_import_batch_id uuid NOT NULL REFERENCES import_batch(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX keyword_niche_status_idx ON keyword (niche_id, status);

CREATE TABLE keyword_alias (
  id uuid PRIMARY KEY,
  keyword_id uuid NOT NULL REFERENCES keyword(id),
  alias text NOT NULL,
  canonical_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT keyword_alias_keyword_hash_uq UNIQUE (keyword_id, canonical_hash)
);

CREATE TABLE import_row (
  id uuid PRIMARY KEY,
  batch_id uuid NOT NULL REFERENCES import_batch(id),
  row_number integer NOT NULL,
  raw_json jsonb NOT NULL,
  row_hash text NOT NULL,
  status import_row_status NOT NULL,
  reject_reason text,
  keyword_id uuid REFERENCES keyword(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT import_row_batch_number_uq UNIQUE (batch_id, row_number)
);

CREATE TABLE keyword_metric (
  id uuid PRIMARY KEY,
  keyword_id uuid NOT NULL REFERENCES keyword(id),
  metric_name text NOT NULL,
  numeric_value numeric(12,3),
  text_value text,
  source_type source_type NOT NULL,
  source_name text NOT NULL,
  source_url text,
  source_ref text,
  confidence numeric(4,3),
  value_status value_status NOT NULL,
  observed_at timestamptz,
  agent_run_id uuid REFERENCES agent_run(id),
  superseded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT keyword_metric_numeric_present CHECK (numeric_value IS NULL OR value_status = 'PRESENT')
);
CREATE UNIQUE INDEX keyword_metric_current_uq ON keyword_metric (keyword_id, metric_name, source_name) WHERE superseded_at IS NULL;

CREATE TABLE facet (
  id uuid PRIMARY KEY,
  kind facet_kind NOT NULL,
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  synonyms text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE keyword_facet (
  id uuid PRIMARY KEY,
  keyword_id uuid NOT NULL REFERENCES keyword(id),
  facet_id uuid NOT NULL REFERENCES facet(id),
  role text NOT NULL,
  agent_run_id uuid REFERENCES agent_run(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT keyword_facet_pair_uq UNIQUE (keyword_id, facet_id)
);

CREATE TABLE keyword_cluster (
  id uuid PRIMARY KEY,
  niche_id uuid NOT NULL REFERENCES niche(id),
  slug text NOT NULL,
  label text NOT NULL,
  method text NOT NULL,
  method_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT keyword_cluster_niche_slug_uq UNIQUE (niche_id, slug)
);

CREATE TABLE keyword_cluster_member (
  id uuid PRIMARY KEY,
  cluster_id uuid NOT NULL REFERENCES keyword_cluster(id),
  keyword_id uuid NOT NULL REFERENCES keyword(id),
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT keyword_cluster_member_pair_uq UNIQUE (cluster_id, keyword_id)
);

CREATE TABLE keyword_analysis (
  id uuid PRIMARY KEY,
  keyword_id uuid NOT NULL REFERENCES keyword(id),
  pattern_type pattern_type NOT NULL,
  intent_type intent_type NOT NULL,
  product_text text,
  qualifier_text text,
  user_text text,
  problem_text text,
  environment_text text,
  constraint_text text,
  confidence numeric(4,3) NOT NULL,
  path text NOT NULL,
  related_candidates jsonb NOT NULL,
  raw_output jsonb NOT NULL,
  agent_run_id uuid NOT NULL REFERENCES agent_run(id),
  superseded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX keyword_analysis_current_uq ON keyword_analysis (keyword_id) WHERE superseded_at IS NULL;

CREATE TABLE keyword_score (
  id uuid PRIMARY KEY,
  keyword_id uuid NOT NULL REFERENCES keyword(id),
  score_kind text NOT NULL,
  model_id text NOT NULL,
  model_version text NOT NULL,
  score numeric(6,3),
  band score_band NOT NULL,
  data_completeness numeric(4,3) NOT NULL,
  components jsonb NOT NULL,
  missing_inputs text[] NOT NULL,
  agent_run_id uuid REFERENCES agent_run(id),
  superseded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT keyword_score_null_iff_insufficient CHECK ((score IS NULL) = (band = 'INSUFFICIENT_DATA')),
  CONSTRAINT keyword_score_missing_iff_complete CHECK ((cardinality(missing_inputs) = 0) = (data_completeness = 1))
);
CREATE UNIQUE INDEX keyword_score_current_uq ON keyword_score (keyword_id, score_kind, model_id) WHERE superseded_at IS NULL;

CREATE TABLE cost_event (
  id uuid PRIMARY KEY,
  agent_run_id uuid NOT NULL REFERENCES agent_run(id),
  provider text NOT NULL,
  model text NOT NULL,
  input_tokens integer NOT NULL,
  output_tokens integer NOT NULL,
  estimated_cost_usd numeric(12,6) NOT NULL CHECK (estimated_cost_usd >= 0),
  occurred_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
