CREATE TABLE IF NOT EXISTS briefing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body jsonb NOT NULL,
  updated_by uuid REFERENCES users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

UPDATE intel_entries SET category = 'Population' WHERE category = 'Faction';
