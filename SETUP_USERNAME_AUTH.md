# 🎉 FitFood AI - Username Authentication Setup

## ✨ ระบบใหม่: Login ด้วย Username + Password เท่านั้น!

**ไม่ต้องใช้อีเมล ไม่ต้องตั้งค่า Authentication ใน Supabase เลย!**

---

## 📋 ขั้นตอนการติดตั้ง (เพียง 2 ขั้นตอน!)

### ขั้นที่ 1: สร้าง Database Tables

1. ไปที่ **Supabase Dashboard**
2. คลิก **SQL Editor** (เมนูซ้าย)
3. คัดลอกโค้ดทั้งหมดจากไฟล์ `database_setup_username.sql`
4. วางใน SQL Editor
5. คลิก **Run** (หรือกด Ctrl+Enter)

✅ **เสร็จแล้ว!** จะได้ tables ทั้งหมด:
- `users` - เก็บ username, password, name
- `sessions` - เก็บ tokens
- `profiles` - เก็บข้อมูลผู้ใช้
- `food_analysis` - เก็บประวัติวิเคราะห์อาหาร
- `workout_plans` - เก็บแผนออกกำลังกาย
- `diet_plans` - เก็บแผนอาหาร

### ขั้นที่ 2: Redeploy Edge Function

1. ไปที่ **Supabase Dashboard**
2. คลิก **Edge Functions** (เมนูซ้าย)
3. เลือก `make-server-e5c31e4c`
4. คลิก **Deploy** (ปุ่มด้านบนขวา)
5. รอจนกว่าจะแสดง "Deployed successfully"

✅ **เสร็จสมบูรณ์!** 🎊

---

## 🚀 ใช้งานทันที!

### ทดสอบ Signup

1. **Refresh หน้าแอป** (กด F5)
2. **คลิก tab "สมัครสมาชิก"**
3. **กรอกข้อมูล:**
   - ชื่อ: `Test User`
   - ชื่อผู้ใช้: `testuser`
   - รหัสผ่าน: `password123`
4. **คลิก "สมัครสมาชิก"**

✅ **ควรเห็นหน้ากรอกข้อมูลโปรไฟล์ทันที**

### ทดสอบ Login

1. ถ้ามี user แล้ว คลิก tab "เข้าสู่ระบบ"
2. กรอก username และ password
3. คลิก "เข้าสู่ระบบ"

✅ **ควรเข้าสู่ Dashboard ทันที**

---

## 🎯 ข้อดีของระบบใหม่

### ✅ ง่ายกว่า
- ไม่ต้องตั้งค่า Authentication ใน Supabase
- ไม่ต้องเปิด Email Provider
- ไม่ต้องปิด Confirm Email

### ✅ เร็วกว่า
- Login ได้ทันที ไม่ต้องรอ
- ไม่มีอีเมลยืนยันส่งมา
- ไม่มี error "Email logins are disabled"

### ✅ สะดวกกว่า
- จำ username ง่ายกว่า email
- สมัครเสร็จเข้าใช้ได้เลย
- Password hash ด้วย SHA-256 (ปลอดภัย)

---

## 🔒 ความปลอดภัย

### Password Hashing
- ใช้ SHA-256 hash password
- ไม่เก็บ plain password ใน database
- Token มีอายุ 30 วัน

### Token System
- สร้าง unique token ทุกครั้งที่ login
- ตรวจสอบ token จาก `sessions` table
- Token expired ต้อง login ใหม่

---

## 📝 ตัวอย่าง API

### Signup
```javascript
POST /make-server-e5c31e4c/signup
{
  "username": "testuser",
  "password": "password123",
  "name": "Test User"
}

Response:
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "testuser",
    "name": "Test User"
  },
  "token": "token_..."
}
```

### Login
```javascript
POST /make-server-e5c31e4c/login
{
  "username": "testuser",
  "password": "password123"
}

Response:
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "testuser",
    "name": "Test User"
  },
  "token": "token_..."
}
```

### Save Profile
```javascript
POST /make-server-e5c31e4c/profile
Headers: Authorization: Bearer token_...
{
  "weight": 70,
  "height": 170,
  "age": 25,
  "gender": "male",
  "goal": "lose_weight",
  "availableTime": "30",
  "activityLevel": "moderate"
}
```

---

## 🆘 แก้ปัญหา

### ❌ "Username ถูกใช้งานแล้ว"

**สาเหตุ:** มี user ชื่อนี้อยู่แล้ว

**แก้:** ใช้ username อื่น หรือลบ user เก่า:

```sql
-- ลบ user เฉพาะ username
DELETE FROM users WHERE username = 'testuser';

-- หรือลบทุก users (ระวัง!)
TRUNCATE users CASCADE;
```

### ❌ "Invalid or expired token"

**สาเหตุ:** Token หมดอายุ หรือไม่มีใน database

**แก้:** Login ใหม่อีกครั้ง

### ❌ "Table 'users' does not exist"

**สาเหตุ:** ยังไม่ได้รัน SQL setup

**แก้:** กลับไปทำ **ขั้นที่ 1** อีกครั้ง

---

## 💡 Tips

- **Test User:** สร้าง test account ไว้ทดสอบ (`testuser` / `password123`)
- **Mock Data:** แอปใช้ Mock Data ได้ทันที ไม่ต้องมี OpenAI API Key
- **Token Storage:** Token เก็บใน localStorage ของเบราว์เซอร์
- **Auto Login:** หลัง signup จะ login อัตโนมัติและไปหน้า profile

---

## ✅ Checklist

- [ ] รัน SQL สร้าง tables (`database_setup_username.sql`)
- [ ] Redeploy Edge Function  
- [ ] ทดสอบ Signup ใหม่
- [ ] ทดสอบ Login
- [ ] ทดสอบกรอกข้อมูล Profile
- [ ] ทดสอบวิเคราะห์อาหาร
- [ ] ทดสอบสร้างแผน AI

---

**🎉 เสร็จแล้ว! ตอนนี้ใช้ Username + Password เท่านั้น ไม่ต้องยุ่งกับ Email อีกแล้ว!** 🚀
