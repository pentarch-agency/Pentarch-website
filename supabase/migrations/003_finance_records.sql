-- Finance Management
-- Tracks income, expenses, and other financial records for the agency.

CREATE TYPE finance_type AS ENUM ('income', 'expense');
CREATE TYPE finance_category AS ENUM (
  'project_payment', 'retainer', 'subscription', 'consulting',
  'salary', 'contractor', 'software', 'hosting', 'marketing',
  'office', 'taxes', 'other'
);
CREATE TYPE finance_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded');

CREATE TABLE finance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type finance_type NOT NULL,
  category finance_category NOT NULL DEFAULT 'other',
  status finance_status NOT NULL DEFAULT 'completed',
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT NOT NULL,
  reference TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_finance_type ON finance_records(type);
CREATE INDEX idx_finance_recorded_at ON finance_records(recorded_at);
CREATE INDEX idx_finance_org ON finance_records(organization_id);

-- RLS
ALTER TABLE finance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can manage finance records"
  ON finance_records FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'founder'
    )
  );
