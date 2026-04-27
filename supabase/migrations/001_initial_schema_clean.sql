-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read all users" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Anyone can read locations" ON locations;
DROP POLICY IF EXISTS "Admins can update locations" ON locations;
DROP POLICY IF EXISTS "Users can read their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON user_favorites;

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  notifications BOOLEAN DEFAULT true,
  notify_when_empty TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create locations table
CREATE TABLE locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  current_density TEXT NOT NULL CHECK (current_density IN ('low', 'medium', 'high')),
  current_count INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  hourly_data JSONB NOT NULL,
  admin_id TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_favorites table
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, location_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_locations_category ON locations(category);
CREATE INDEX IF NOT EXISTS idx_locations_density ON locations(current_density);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_location_id ON user_favorites(location_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- RLS Policies for locations table
CREATE POLICY "Anyone can read locations" ON locations
  FOR SELECT USING (true);

CREATE POLICY "Admins can update locations" ON locations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- RLS Policies for user_favorites table
CREATE POLICY "Users can read their own favorites" ON user_favorites
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own favorites" ON user_favorites
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own favorites" ON user_favorites
  FOR DELETE USING (user_id = auth.uid()::text);

-- Insert mock users
INSERT INTO users (id, username, password, role, full_name, email, phone, notifications, notify_when_empty)
VALUES
  ('user1', 'user', 'user123', 'user', 'สมชาย ใจดี', 'somchai@example.com', '081-234-5678', true, ARRAY['1', '2']),
  ('admin1', 'admin', 'admin123', 'admin', 'ผู้ดูแลระบบ ห้องสมุด', 'admin@example.com', '082-345-6789', true, ARRAY[]::TEXT[]),
  ('admin2', 'admin2', 'admin123', 'admin', 'ผู้ดูแลระบบ โรงอาหาร', 'admin2@example.com', '083-456-7890', true, ARRAY[]::TEXT[]);

-- Insert mock locations
INSERT INTO locations (id, name, name_en, category, image, current_density, current_count, capacity, latitude, longitude, hourly_data, admin_id)
VALUES
  (
    '1',
    'หอสมุดป๋วย อึ้งภากรณ์',
    'Puey Ungphakorn Library, Thammasat University',
    'หอสมุด',
    'library',
    'low',
    15,
    120,
    13.7563,
    100.5018,
    '[
      {"hour": 8, "count": 10, "density": "low"},
      {"hour": 9, "count": 25, "density": "low"},
      {"hour": 10, "count": 45, "density": "medium"},
      {"hour": 11, "count": 65, "density": "medium"},
      {"hour": 12, "count": 90, "density": "high"},
      {"hour": 13, "count": 95, "density": "high"},
      {"hour": 14, "count": 80, "density": "high"},
      {"hour": 15, "count": 70, "density": "medium"},
      {"hour": 16, "count": 55, "density": "medium"},
      {"hour": 17, "count": 40, "density": "medium"},
      {"hour": 18, "count": 25, "density": "low"},
      {"hour": 19, "count": 15, "density": "low"},
      {"hour": 20, "count": 20, "density": "low"}
    ]'::jsonb,
    'admin1'
  ),
  (
    '2',
    'TU ฟิตเนส',
    'TU Fitness',
    'ฟิตเนส',
    'gym',
    'high',
    75,
    80,
    13.7565,
    100.5025,
    '[
      {"hour": 6, "count": 45, "density": "medium"},
      {"hour": 7, "count": 70, "density": "high"},
      {"hour": 8, "count": 75, "density": "high"},
      {"hour": 9, "count": 65, "density": "high"},
      {"hour": 10, "count": 50, "density": "medium"},
      {"hour": 11, "count": 35, "density": "medium"},
      {"hour": 12, "count": 25, "density": "low"},
      {"hour": 13, "count": 20, "density": "low"},
      {"hour": 14, "count": 30, "density": "medium"},
      {"hour": 15, "count": 40, "density": "medium"},
      {"hour": 16, "count": 50, "density": "medium"},
      {"hour": 17, "count": 70, "density": "high"},
      {"hour": 18, "count": 78, "density": "high"},
      {"hour": 19, "count": 60, "density": "high"},
      {"hour": 20, "count": 45, "density": "medium"}
    ]'::jsonb,
    'admin1'
  ),
  (
    '3',
    'โรงอาหาร JC',
    'JC Cafeteria',
    'โรงอาหาร',
    'cafeteria',
    'medium',
    140,
    250,
    13.7560,
    100.5015,
    '[
      {"hour": 7, "count": 30, "density": "low"},
      {"hour": 8, "count": 60, "density": "low"},
      {"hour": 9, "count": 80, "density": "medium"},
      {"hour": 10, "count": 70, "density": "medium"},
      {"hour": 11, "count": 150, "density": "medium"},
      {"hour": 12, "count": 230, "density": "high"},
      {"hour": 13, "count": 220, "density": "high"},
      {"hour": 14, "count": 140, "density": "medium"},
      {"hour": 15, "count": 90, "density": "medium"},
      {"hour": 16, "count": 100, "density": "medium"},
      {"hour": 17, "count": 180, "density": "high"},
      {"hour": 18, "count": 200, "density": "high"},
      {"hour": 19, "count": 120, "density": "medium"},
      {"hour": 20, "count": 60, "density": "low"}
    ]'::jsonb,
    'admin2'
  ),
  (
    '4',
    'ห้องคอมคณะวิศวะ ชั้น 2',
    'Engineering Computer Lab Floor 2',
    'ห้องคอมพิวเตอร์',
    'computer',
    'low',
    20,
    100,
    13.7568,
    100.5020,
    '[
      {"hour": 8, "count": 15, "density": "low"},
      {"hour": 9, "count": 30, "density": "low"},
      {"hour": 10, "count": 50, "density": "medium"},
      {"hour": 11, "count": 60, "density": "medium"},
      {"hour": 12, "count": 45, "density": "medium"},
      {"hour": 13, "count": 55, "density": "medium"},
      {"hour": 14, "count": 70, "density": "high"},
      {"hour": 15, "count": 65, "density": "medium"},
      {"hour": 16, "count": 50, "density": "medium"},
      {"hour": 17, "count": 35, "density": "low"},
      {"hour": 18, "count": 25, "density": "low"},
      {"hour": 19, "count": 20, "density": "low"},
      {"hour": 20, "count": 15, "density": "low"}
    ]'::jsonb,
    'admin2'
  ),
  (
    '5',
    'สระว่ายน้ำ',
    'Swimming Pool',
    'ศูนย์กีฬา',
    'pool',
    'medium',
    30,
    50,
    13.7555,
    100.5012,
    '[
      {"hour": 6, "count": 20, "density": "medium"},
      {"hour": 7, "count": 25, "density": "medium"},
      {"hour": 8, "count": 30, "density": "medium"},
      {"hour": 9, "count": 35, "density": "high"},
      {"hour": 10, "count": 40, "density": "high"},
      {"hour": 11, "count": 35, "density": "high"},
      {"hour": 12, "count": 25, "density": "medium"},
      {"hour": 13, "count": 20, "density": "medium"},
      {"hour": 14, "count": 30, "density": "medium"},
      {"hour": 15, "count": 35, "density": "high"},
      {"hour": 16, "count": 45, "density": "high"},
      {"hour": 17, "count": 40, "density": "high"},
      {"hour": 18, "count": 30, "density": "medium"},
      {"hour": 19, "count": 20, "density": "medium"}
    ]'::jsonb,
    'admin1'
  ),
  (
    '6',
    'หอสมุดป๋วยชั้น 2',
    'Puey Ungphakorn Library Floor 2',
    'หอสมุด',
    'library',
    'low',
    25,
    100,
    13.7563,
    100.5018,
    '[
      {"hour": 8, "count": 15, "density": "low"},
      {"hour": 9, "count": 30, "density": "low"},
      {"hour": 10, "count": 50, "density": "medium"},
      {"hour": 11, "count": 70, "density": "high"},
      {"hour": 12, "count": 85, "density": "high"},
      {"hour": 13, "count": 80, "density": "high"},
      {"hour": 14, "count": 65, "density": "medium"},
      {"hour": 15, "count": 55, "density": "medium"},
      {"hour": 16, "count": 45, "density": "medium"},
      {"hour": 17, "count": 35, "density": "low"},
      {"hour": 18, "count": 20, "density": "low"},
      {"hour": 19, "count": 15, "density": "low"},
      {"hour": 20, "count": 25, "density": "low"}
    ]'::jsonb,
    'admin1'
  );
