CREATE TABLE IF NOT EXISTS pilot_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  callsign text,
  name text,
  background text,
  status text,
  portrait_url text,
  mechs jsonb NOT NULL,
  raw jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
