-- Create seat_status table for real-time seat monitoring
-- Specifically for Puey Library Floor 2 (2 zones)

DROP TABLE IF EXISTS seat_status CASCADE;

CREATE TABLE seat_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  zone_name TEXT NOT NULL, -- 'Zone A' หรือ 'Zone B'
  total_seats INTEGER NOT NULL,
  occupied_seats INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  standing_people INTEGER DEFAULT 0, -- คนที่ยืน/ไม่ได้นั่ง
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(location_id, zone_name)
);

-- Create index for faster queries
CREATE INDEX idx_seat_status_location ON seat_status(location_id);
CREATE INDEX idx_seat_status_updated ON seat_status(updated_at DESC);

-- Insert initial data for Puey Library Floor 2 (2 zones)
-- location_id = '1' is Puey Library
INSERT INTO seat_status (location_id, zone_name, total_seats, occupied_seats, available_seats, standing_people) VALUES
  ('1', 'Zone A - Silent Study', 80, 45, 35, 3),
  ('1', 'Zone B - Group Study', 60, 38, 22, 5);

-- Disable RLS for easier access (app controls access via UI)
ALTER TABLE seat_status DISABLE ROW LEVEL SECURITY;

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_seat_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS seat_status_updated_at ON seat_status;
CREATE TRIGGER seat_status_updated_at
  BEFORE UPDATE ON seat_status
  FOR EACH ROW
  EXECUTE FUNCTION update_seat_status_timestamp();

-- Add comment
COMMENT ON TABLE seat_status IS 'Real-time seat availability tracking for library zones';
COMMENT ON COLUMN seat_status.zone_name IS 'Zone identifier (e.g., Zone A, Zone B)';
COMMENT ON COLUMN seat_status.standing_people IS 'Number of people not seated (standing/walking)';
