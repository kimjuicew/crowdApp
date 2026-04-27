-- 🚀 FitFood AI - Database Setup (Username-based Auth)
-- ระบบ Login/Signup แบบง่ายๆ ใช้ Username + Password

-- ลบ tables เก่าถ้ามี (ระวัง! จะลบข้อมูลทั้งหมด)
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS diet_plans CASCADE;
DROP TABLE IF EXISTS workout_plans CASCADE;
DROP TABLE IF EXISTS food_analysis CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (แทน auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Sessions Table (เก็บ tokens)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Profiles Table (เก็บข้อมูลผู้ใช้)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  age INTEGER,
  gender TEXT,
  goal TEXT,
  available_time TEXT,
  activity_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Food Analysis Table
CREATE TABLE food_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  calories INTEGER,
  protein DECIMAL(5,2),
  carbs DECIMAL(5,2),
  fat DECIMAL(5,2),
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Workout Plans Table
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  schedule JSONB,
  tips JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Diet Plans Table
CREATE TABLE diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  daily_calories INTEGER,
  macros JSONB,
  meals JSONB,
  tips JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- สร้าง Indexes สำหรับเพิ่มความเร็ว
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_food_analysis_user_id ON food_analysis(user_id);
CREATE INDEX idx_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX idx_diet_plans_user_id ON diet_plans(user_id);

-- ✅ เสร็จสิ้น! ไม่ต้องตั้งค่า Authentication ใน Supabase Dashboard เลย
-- ระบบใช้ Username + Password แบบง่ายๆ ผ่าน Edge Functions

-- 📝 หมายเหตุ:
-- - ไม่ต้องใช้ RLS (Row Level Security) เพราะ Edge Function ใช้ Service Role Key
-- - ไม่ต้องตั้งค่า Authentication Providers ใน Supabase
-- - ไม่มีอีเมลยืนยัน ไม่มี Email Provider
-- - Login ด้วย Username + Password เท่านั้น
