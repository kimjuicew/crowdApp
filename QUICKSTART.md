# 🚀 Quick Start - FitFood AI

## ⚠️ ต้องตั้งค่า Authentication ก่อน!

**อ่านคู่มือนี้ทีละขั้นตอน:** 📖 `SUPABASE_AUTH_SETUP.md`

---

## ✅ สิ่งที่ต้องทำก่อนใช้งาน (แบบย่อ)

### 1️⃣ ตั้งค่า Authentication ใน Supabase

**ดูรายละเอียดใน:** `SUPABASE_AUTH_SETUP.md` ⭐

สรุปสั้นๆ:
- เปิด **Email Provider** (Authentication > Providers)
- ตั้งค่า **Email Auth** (ยกเลิก Confirm Email)
- ลบ **User เก่า** (ถ้ามี)

### 2️⃣ สร้าง Database Tables

ไปที่ **Supabase Dashboard** > **SQL Editor** แล้ว:
- คัดลอกโค้ดจากไฟล์ `database_setup.sql`
- วางและคลิก **Run**

### 3️⃣ Redeploy Edge Function

ไปที่ **Supabase Dashboard** > **Edge Functions**:
- เลือก `make-server-e5c31e4c`
- คลิก **Deploy**

---

## 🎉 เสร็จแล้ว!

ตอนนี้คุณสามารถ:
- ✅ สมัครสมาชิกได้ทันที (ไม่ต้องยืนยันอีเมล)
- ✅ วิเคราะห์อาหาร (ใช้ Mock Data)
- ✅ สรางแผน Workout & Diet (ใช้ Mock Data)

---

## 🤖 ต้องการใช้ AI จริงๆ?

เพิ่ม OpenAI API Key:
1. สมัครที่ [platform.openai.com](https://platform.openai.com/signup)
2. สร้าง API Key
3. เพิ่มใน **Supabase** > **Edge Functions** > **Settings**:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `sk-proj-...`
4. Redeploy Edge Function

---

## 📚 เอกสารเพิ่มเติม

- 📖 **SETUP_INSTRUCTIONS.md** - คู่มือละเอียด
- 📧 **DISABLE_EMAIL_CONFIRMATION.md** - วิธีปิดการยืนยันอีเมล
- 🗄️ **database_setup.sql** - SQL Script สำหรับสร้าง tables

---

**💡 Tips:** แอปใช้ Mock Data ได้ทันที! ไม่ต้องมี OpenAI API Key ก็ทดสอบได้