ALTER TABLE factions RENAME TO intel_entries;
ALTER TABLE intel_entries ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Faction';
ALTER TABLE intel_entries ALTER COLUMN category DROP DEFAULT;

CREATE TABLE IF NOT EXISTS intel_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL UNIQUE REFERENCES intel_entries(id) ON DELETE CASCADE,
  body jsonb NOT NULL,
  updated_by uuid REFERENCES users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
