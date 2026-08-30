DROP TABLE IF EXISTS faction_responses;
DROP TABLE IF EXISTS faction_posts;

CREATE TABLE IF NOT EXISTS factions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  image_url text,
  body jsonb NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
