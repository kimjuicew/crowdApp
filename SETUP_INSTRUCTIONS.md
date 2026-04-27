# 🏋️ FitFood AI - คู่มือการตั้งค่า

แอป AI วิเคราะห์อาหารและวางแผนออกกำลังกาย พร้อมระบบ Authentication

## 📋 ฟีเจอร์หลัก

✅ **Login/Signup** - ระบบสมัครสมาชิกและเข้าสู่ระบบด้วย Supabase Auth  
✅ **จัดการข้อมูลโปรไฟล์** - กรอกน้ำหนัก ส่วนสูง เป้าหมาย และเวลาว่าง  
✅ **วิเคราะห์อาหาร** - อัพโหลดรูปอาหาร AI บอกแคลอรี่ โปรตีน คาร์บ ไขมัน  
✅ **สร้าง Workout Plan** - AI สร้างแผนออกกำลังกายตามข้อมูลคุณ  
✅ **สร้าง Diet Plan** - AI วางแผนอาหารตามเป้าหมาย  

---

## 🚀 ขั้นตอนการตั้งค่า Supabase

### 1. สร้าง Database Tables

ไปที่ **Supabase Dashboard** > **SQL Editor** แล้วรันคำสั่งนี้:

```sql
-- สร้าง profiles table
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

-- สร้าง food_analysis table
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

-- สร้าง workout_plans table
CREATE TABLE IF NOT EXISTS workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  schedule JSONB,
  tips JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง diet_plans table
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

-- ปิด RLS เพื่อให้ Service Role เข้าถึงได้
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE food_analysis DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans DISABLE ROW LEVEL SECURITY;
```

### 2. ตั้งค่า Environment Variables

Environment Variables ถูกตั้งค่าแล้วใน Supabase Dashboard:
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `SUPABASE_DB_URL`

### 3. ตั้งค่า OpenAI API Key (Optional)

**สำคัญ:** ตอนนี้แอปใช้ **Mock Data** ได้แล้ว! คุณสามารถทดสอบฟีเจอร์ทั้งหมดโดยไม่ต้องมี OpenAI API Key

**ถ้าต้องการใช้ AI จริง:**
1. สมัคร OpenAI ที่ [platform.openai.com](https://platform.openai.com/signup)
2. สร้าง API Key ที่ [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
3. เติมเครดิตอย่างน้อย $5-10 USD
4. ไปที่ **Supabase Dashboard** > **Edge Functions** > **Settings**
5. เพิ่ม Secret:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `sk-proj-...` (API Key ของคุณ)

---

## 🎯 การใช้งาน

### 1. สมัครสมาชิก
- กรอกชื่อ, อีเมล, รหัสผ่าน
- กรอกข้อมูลส่วนตัว (น้ำหนัก, ส่วนสูง, เป้าหมาย)

### 2. วิเคราะห์อาหาร
- อัพโหลดรูปอาหาร
- **ถ้าไม่มี OpenAI Key:** ได้ Mock Data (ข้าวผัดกุ้ง)
- **ถ้ามี OpenAI Key:** AI วิเคราะห์อาหารจริงๆ

### 3. สร้างแผน AI
- ไปที่ "แผน AI"
- คลิก "สร้างแผนด้วย AI"
- **ถ้าไม่มี OpenAI Key:** ได้แผน Template ตามโปรไฟล์คุณ
- **ถ้ามี OpenAI Key:** AI สร้างแผนส่วนตัวให้คุณ

---

## 🗂️ โครงสร้าง Database

```
auth.users (Supabase Auth)
│
├── profiles (ข้อมูลส่วนตัว)
│   ├── user_id (FK → auth.users.id)
│   ├── weight, height, age, gender
│   ├── goal (เป้าหมาย)
│   ├── available_time (เวลาว่าง)
│   └── activity_level (ระดับกิจกรรม)
│
├── food_analysis (ประวัติวิเคราะห์อาหาร)
│   ├── user_id (FK → auth.users.id)
│   ├── food_name, calories
│   └── protein, carbs, fat
│
├── workout_plans (แผนออกกำลังกาย)
│   ├── user_id (FK → auth.users.id)
│   ├── title, description
│   └── schedule (JSONB), tips (JSONB)
│
└── diet_plans (แผนอาหาร)
    ├── user_id (FK → auth.users.id)
    ├── title, description
    ├── daily_calories
    └── macros (JSONB), meals (JSONB)
```

---

## 🔧 API Endpoints

```
POST /make-server-e5c31e4c/signup
POST /make-server-e5c31e4c/profile
GET  /make-server-e5c31e4c/profile
POST /make-server-e5c31e4c/analyze-food
POST /make-server-e5c31e4c/generate-plans
```

---

## 📝 หมายเหตุ

- **Mock Data Mode:** ถ้าไม่มี OpenAI API Key ระบบจะใช้ข้อมูลตัวอย่างแทน
- **Real AI Mode:** เมื่อมี OpenAI API Key ระบบจะวิเคราะห์จริงด้วย GPT-4o-mini
- **RLS ปิดอยู่:** เพื่อให้ Service Role เข้าถึงข้อมูลได้ (สำหรับ production ควรเปิด RLS)

---

## ✅ Checklist

- [x] ตั้งค่า Supabase Project
- [x] ตั้งค่า Environment Variables
- [ ] สร้าง Database Tables (รัน SQL ด้านบน)
- [ ] **ปิดการยืนยันอีเมล** (ดูไฟล์ `DISABLE_EMAIL_CONFIRMATION.md`)
- [ ] **(Optional)** ตั้งค่า OpenAI API Key
- [ ] Redeploy Edge Function
- [ ] ทดสอบสมัครสมาชิกและ Login
- [ ] ทดสอบกรอกข้อมูลโปรไฟล์
- [ ] ทดสอบวิเคราะห์อาหาร
- [ ] ทดสอบสร้างแผน AI

---

## 🚨 แก้ปัญหา Email Confirmation

ถ้ามีอีเมลยืนยันส่งมาเยอะ:

1. ไปที่ **Supabase Dashboard** > **Authentication** > **Settings**
2. ยกเลิกเครื่องหมายถูกที่ **Confirm Email**
3. เปิดใช้งาน **Auto Confirm**
4. **หรือ** ดูคำแนะนำใน `DISABLE_EMAIL_CONFIRMATION.md`

**หมายเหตุ:** โค้ดใช้ `email_confirm: true` แล้ว ซึ่งจะยืนยันอีเมลอัตโนมัติโดยไม่ส่งอีเมล

---

**🎉 เสร็จแล้ว! ลองใช้งานได้เลย**