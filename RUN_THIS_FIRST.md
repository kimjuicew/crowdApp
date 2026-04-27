# ⚠️ คำแนะนำก่อนใช้งาน - RUN THIS FIRST!

## 🚀 ขั้นตอนการ Setup Supabase Database

คุณต้องรัน SQL migration เพื่อสร้างฐานข้อมูลก่อนใช้งานแอพ:

### 1. เข้าสู่ Supabase Dashboard
ไปที่: https://supabase.com/dashboard/project/xqogrrdeepicusvryfud/sql/new

### 2. รัน SQL Migration
1. คลิก **SQL Editor** ในเมนูด้านซ้าย
2. คลิก **New query**
3. เปิดไฟล์ `supabase/migrations/001_initial_schema.sql`
4. คัดลอกเนื้อหาทั้งหมดในไฟล์
5. วางลงใน SQL Editor
6. คลิกปุ่ม **Run** หรือกด `Ctrl+Enter`

### 3. ตรวจสอบผลลัพธ์
หลังจากรันเสร็จ ให้ไปที่ **Table Editor** และตรวจสอบว่ามีตารางทั้ง 3 ตาราง:
- ✅ `users` (3 rows)
- ✅ `locations` (6 rows)
- ✅ `user_favorites` (0 rows initially)

### 4. ทดสอบการใช้งาน
เปิดแอพและลองทำดังนี้:

**ทดสอบ Login:**
- Username: `user` / Password: `user123` (ผู้ใช้ทั่วไป)
- Username: `admin` / Password: `admin123` (ผู้ดูแลระบบ)

**ทดสอบ Sign Up:**
- สมัครสมาชิกใหม่
- ข้อมูลจะถูกบันทึกใน Supabase

**ทดสอบ Features:**
- ✅ เข้าดูรายละเอียดสถานที่
- ✅ กดปุ่ม ⭐ (Favorite) - ข้อมูลจะบันทึกใน `user_favorites`
- ✅ กดปุ่ม 🔔 (Notification) - ข้อมูลจะบันทึกใน `users.notify_when_empty`
- ✅ ไปที่ Profile - จะเห็นสถานที่โปรดที่บันทึกไว้
- ✅ แก้ไขข้อมูลส่วนตัว - ข้อมูลจะบันทึกลง Supabase

## 📊 Database Schema Overview

### Users Table
เก็บข้อมูลผู้ใช้และการตั้งค่า

### Locations Table  
เก็บข้อมูลสถานที่และความหนาแน่นแบบเรียลไทม์

### User Favorites Table
เก็บความสัมพันธ์ระหว่างผู้ใช้กับสถานที่โปรด

## 🔐 Security Notes

- ⚠️ แอพนี้ใช้ plain text password สำหรับ demo เท่านั้น
- ⚠️ ใน production ควรใช้ Supabase Auth แทน
- ✅ RLS (Row Level Security) ถูกเปิดใช้งานแล้ว

## ❓ Troubleshooting

### ถ้าหน้า Dashboard ว่างเปล่า:
- ตรวจสอบว่ารัน migration แล้ว
- เปิด Browser Console (F12) เพื่อดู error
- ตรวจสอบว่า `locations` table มีข้อมูล 6 rows

### ถ้า Login ไม่ได้:
- ตรวจสอบว่า `users` table มีข้อมูล
- เปิด Browser Console เพื่อดู error
- ลองใช้ demo account: user/user123

### ถ้าปุ่ม Favorite/Notification ไม่ทำงาน:
- ตรวจสอบว่าได้ login แล้ว
- เปิด Browser Console เพื่อดู error
- ตรวจสอบว่า `user_favorites` table ถูกสร้างแล้ว

---

**✨ หลังจากรัน migration เรียบร้อยแล้ว ทุกอย่างพร้อมใช้งาน!**
