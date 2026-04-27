-- ========================================
-- FitFood AI - Database Setup Script
-- ========================================
-- คัดลอกและรันคำสั่งนี้ใน Supabase SQL Editor

-- สร้าง profiles table (ข้อมูลโปรไฟล์ผู้ใช้)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  age INTEGER,
  gender VARCHAR(20),
  goal VARCHAR(50),
  available_time VARCHAR(20),
  activity_level VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- สร้าง food_analysis table (ประวัติการวิเคราะห์อาหาร)
CREATE TABLE IF NOT EXISTS food_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name VARCHAR(255),
  calories INTEGER,
  protein DECIMAL(6,2),
  carbs DECIMAL(6,2),
  fat DECIMAL(6,2),
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง workout_plans table (แผนออกกำลังกาย)
CREATE TABLE IF NOT EXISTS workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  schedule JSONB,
  tips JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง diet_plans table (แผนอาหาร)
CREATE TABLE IF NOT EXISTS diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  daily_calories INTEGER,
  macros JSONB,
  meals JSONB,
  tips JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ปิด RLS (Row Level Security) เพื่อให้ Service Role เข้าถึงได้
-- หมายเหตุ: สำหรับ production ควรเปิด RLS และตั้งค่า policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE food_analysis DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans DISABLE ROW LEVEL SECURITY;

-- สร้าง indexes เพื่อเพิ่มประสิทธิภาพ
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_food_analysis_user_id ON food_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_user_id ON diet_plans(user_id);

-- เสร็จสิ้น! ✅
-- ตรวจสอบได้ที่ Table Editor ใน Supabase Dashboard
