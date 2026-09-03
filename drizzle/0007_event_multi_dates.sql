ALTER TABLE events ADD COLUMN IF NOT EXISTS event_dates jsonb;

UPDATE events
SET event_dates = CASE
  WHEN event_date IS NOT NULL THEN to_jsonb(ARRAY[to_char(event_date, 'YYYY-MM-DD')])
  ELSE '[]'::jsonb
END
WHERE event_dates IS NULL;

ALTER TABLE events ALTER COLUMN event_dates SET NOT NULL;
ALTER TABLE events ALTER COLUMN event_dates SET DEFAULT '[]'::jsonb;
ALTER TABLE events DROP COLUMN IF EXISTS event_date;
