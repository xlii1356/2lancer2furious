ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS image text;
