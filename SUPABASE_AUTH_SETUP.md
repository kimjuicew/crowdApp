# 🔐 คู่มือตั้งค่า Authentication ใน Supabase (ทีละขั้นตอน)

## 📋 สิ่งที่ต้องทำทั้งหมด (5 ขั้นตอน)

1. ✅ เปิด Email Provider
2. ✅ ตั้งค่า Email Authentication  
3. ✅ ปิดการยืนยันอีเมล
4. ✅ ลบ User เก่า (ถ้ามี)
5. ✅ รัน SQL สร้าง Tables

---

## 🚀 เริ่มเลย!

### ขั้นตอนที่ 1: เข้าสู่ Supabase Dashboard

1. เปิดเบราว์เซอร์
2. ไปที่: **https://supabase.com/dashboard**
3. Login เข้าสู่ระบบ
4. **เลือก Project ของคุณ** (คลิกที่ชื่อ project)

---

## ✅ ขั้นตอนที่ 2: เปิด Email Provider (สำคัญมาก!)

### 2.1 ไปที่เมนู Authentication

```
1. มองไปที่เมนูด้านซ้ายมือ
2. หา "Authentication" (ไอคอน 🔐)
3. คลิก "Authentication"
```

### 2.2 ไปที่ Providers

```
1. ใต้เมนู Authentication จะมีหลายเมนูย่อย
2. คลิก "Providers"
```

### 2.3 เปิด Email Provider

```
1. จะเห็นรายการ Providers หลายตัว (Email, Phone, Google, etc.)
2. หา "Email" (ควรอยู่อันแรก)
3. คลิกที่ "Email" เพื่อเปิดการตั้งค่า
4. เลื่อนลงมา จะเห็น Toggle Switch
5. **เปิด Toggle Switch** ให้เป็นสีเขียว (เปิดใช้งาน)
   
   Toggle: ⚪ OFF  →  ตั้งเป็น  →  🟢 ON

6. คลิกปุ่ม "Save" (ด้านล่างขวา)
```

**✅ เสร็จแล้ว! Email Provider เปิดแล้ว**

---

## ✅ ขั้นตอนที่ 3: ตั้งค่า Email Authentication

### 3.1 ไปที่ Configuration

```
1. อยู่ในเมนู Authentication อยู่แล้ว
2. คลิก "Configuration" (เมนูย่อย)
```

### 3.2 ตั้งค่า Email Settings

```
1. เลื่อนหาส่วน "Email" หรือ "Email Auth"
2. ตรวจสอบการตั้งค่าให้เป็นแบบนี้:

   ☑️ Enable Email Signup (ต้องติ๊กเครื่องหมายถูก)
   ☐ Confirm Email (ต้อง ยกเลิก เครื่องหมายถูก) ⭐ สำคัญมาก!
   ☑️ Secure email change (ติ๊กหรือไม่ก็ได้)

3. คลิก "Save" (ด้านล่างขวา)
```

**สำคัญมาก!** 🚨
- **Confirm Email ต้องปิด (ไม่ติ๊ก) ☐** เพื่อไม่ให้ส่งอีเมลยืนยัน
- **Enable Email Signup ต้องเปิด (ติ๊ก) ☑️** เพื่อให้สมัครสมาชิกได้

### 3.3 ปิด Email Template (ทางเลือก)

ถ้ายังมีอีเมลยืนยันส่งมา ให้ปิด Email Template:

```
1. อยู่ในเมนู Authentication อยู่แล้ว
2. คลิก "Email Templates" (เมนูย่อย)
3. เลือก "Confirm signup"
4. ลบเนื้อหาทั้งหมดใน Subject และ Body
5. หรือปิด Toggle "Enabled" (ถ้ามี)
6. คลิก "Save"
```

---

## ✅ ขั้นตอนที่ 4: ตั้งค่า Site URL (ถ้าจำเป็น)

### 4.1 ไปที่ URL Configuration

```
1. อยู่ในเมนู Authentication อยู่แล้ว
2. คลิก "URL Configuration" (เมนูย่อย)
```

### 4.2 ตรวจสอบ Site URL

```
1. ดูที่ "Site URL" 
2. ควรเป็น:
   
   Site URL: https://titqznaxipkpiifdtayn.supabase.co
   
   หรือ domain ของคุณ

3. ถ้าไม่มี ให้เพิ่ม Site URL ของคุณ
4. คลิก "Save"
```

### 4.3 เพิ่ม Redirect URLs (ถ้าจำเป็น)

```
1. ดูที่ "Redirect URLs"
2. เพิ่ม URLs เหล่านี้ (ทีละบรรทัด):

   http://localhost:5173
   http://localhost:5173/**
   https://titqznaxipkpiifdtayn.supabase.co
   https://titqznaxipkpiifdtayn.supabase.co/**

3. คลิก "Save"
```

---

## ✅ ขั้นตอนที่ 5: ลบ User เก่า (แก้ปัญหา "User already registered")

### 5.1 ไปที่ Users

```
1. อยู่ในเมนู Authentication อยู่แล้ว
2. คลิก "Users" (เมนูย่อย)
```

### 5.2 ตรวจสอบและลบ User

```
1. จะเห็นรายการ Users ทั้งหมด
2. ถ้ามี User ที่ต้องการลบ:
   
   a. คลิกที่แถว User นั้น
   b. คลิกปุ่ม "..." (จุด 3 จุด) ที่ด้านขวามือ
   c. เลือก "Delete user"
   d. ยืนยันการลบ

3. หรือลบทุก Users ด้วย SQL (ดูขั้นตอนถัดไป)
```

---

## ✅ ขั้นตอนที่ 6: รัน SQL สร้าง Tables และลบ Users เก่า

### 6.1 ไปที่ SQL Editor

```
1. มองไปที่เมนูด้านซ้ายมือ
2. หา "SQL Editor" (ไอคอน 📝)
3. คลิก "SQL Editor"
```

### 6.2 ลบ Users เก่า (ถ้ามี)

```
1. คลิก "+ New query" (ปุ่มสีน้ำเงิน ด้านบนซ้าย)
2. วางโค้ดนี้:
```

```sql
-- ลบ Users ทั้งหมด (ระวัง! จะลบทุก user)
TRUNCATE auth.users CASCADE;
```

```
3. คลิกปุ่ม "Run" (ด้านล่างขวา) หรือกด Ctrl+Enter
4. ควรเห็นข้อความ "Success. No rows returned"
```

### 6.3 สร้าง Database Tables

```
1. คลิก "+ New query" อีกครั้ง
2. เปิดไฟล์ database_setup.sql ใน project
3. คัดลอกโค้ดทั้งหมดจาก database_setup.sql
4. วางใน SQL Editor
5. คลิกปุ่ม "Run" หรือกด Ctrl+Enter
6. รอจนกว่าจะแสดง "Success"
```

**✅ เสร็จแล้ว! Tables ถูกสร้างเรียบร้อย**

---

## ✅ ขั้นตอนที่ 7: Redeploy Edge Function

### 7.1 ไปที่ Edge Functions

```
1. มองไปที่เมนูด้านซ้ายมือ
2. หา "Edge Functions" (ไอคอน ⚡)
3. คลิก "Edge Functions"
```

### 7.2 Deploy Function

```
1. จะเห็นรายการ Functions
2. หา "make-server-e5c31e4c"
3. คลิกที่ชื่อ function
4. คลิกปุ่ม "Deploy" (ด้านบนขวา)
5. รอจนกว่าจะแสดง "Deployed successfully"
```

**หรือ** ถ้าไม่มีปุ่ม Deploy:

```
1. คลิกปุ่ม "..." (จุด 3 จุด) ข้าง function
2. เลือก "Redeploy"
3. ยืนยัน
```

---

## 🎉 เสร็จแล้ว! ทดสอบการใช้งาน

### ทดสอบ Signup & Login

1. **Refresh หน้าแอป** (กด F5 หรือ Ctrl+R)
2. **ลอง Signup ใหม่:**
   - ใส่อีเมล: `test@example.com`
   - ใส่รหัสผ่าน: `password123`
   - ใส่ชื่อ: `Test User`
   - คลิก "สมัครสมาชิก"

3. **ถ้าสำเร็จ:**
   - ไม่มีอีเมลยืนยันส่งมา ✅
   - Login อัตโนมัติทันที ✅
   - ไปหน้า Dashboard ✅

4. **ถ้ายังมี error:**
   - ดูข้อความ error
   - ตรวจสอบ Console (กด F12)
   - ลองทำขั้นตอนที่ 2-6 อีกครั้ง

---

## 🔍 ตรวจสอบว่าทำถูกหรือไม่

### ✅ Checklist สำเร็จ

ตรวจสอบว่าทำครบทุกข้อแล้ว:

- [ ] **Authentication > Providers > Email** = 🟢 ON
- [ ] **Authentication > Configuration** = ☑️ Enable Email Signup
- [ ] **Authentication > Configuration** = ☐ Confirm Email (ปิด)
- [ ] **SQL Editor** = รัน `database_setup.sql` เรียบร้อย
- [ ] **Edge Functions** = Deploy `make-server-e5c31e4c` สำเร็จ
- [ ] **ทดสอบ Signup** = สมัครสมาชิกได้โดยไม่มีอีเมลยืนยัน
- [ ] **ทดสอบ Login** = เข้าสู่ระบบได้

---

## 🚨 ปัญหาที่พบบ่อย

### ❌ "Email logins are disabled"

**สาเหตุ:** Email Provider ไม่ได้เปิด

**แก้:** กลับไปทำ **ขั้นตอนที่ 2** อีกครั้ง (เปิด Email Provider)

---

### ❌ "User already registered"

**สาเหตุ:** มี user เก่าอยู่ในระบบ

**แก้:** กลับไปทำ **ขั้นตอนที่ 5** หรือ **6.2** (ลบ Users เก่า)

---

### ❌ "Invalid login credentials"

**สาเหตุ:** อีเมลหรือรหัสผ่านไม่ถูกต้อง

**แก้:** 
1. ตรวจสอบว่า Signup สำเร็จหรือไม่
2. ลองใช้อีเมลและรหัสผ่านเดิม
3. หรือสมัครใหม่ด้วยอีเมลอื่น

---

### ❌ "Failed to fetch" หรือ Network Error

**สาเหตุ:** Edge Function ไม่ได้ deploy หรือมีปัญหา

**แก้:** กลับไปทำ **ขั้นตอนที่ 7** อีกครั้ง (Redeploy Edge Function)

---

## 📸 ภาพรวมเมนู Supabase Dashboard

```
📁 Project
   📊 Table Editor
   🔐 Authentication          ← เริ่มที่นี่
      📧 Users                 ← ดู/ลบ users
      ⚙️  Providers            ← เปิด Email Provider
      ⚙️  Configuration        ← ตั้งค่า Email Auth
      🔗 URL Configuration     ← ตั้งค่า URLs
      📧 Email Templates
   📝 SQL Editor              ← รัน SQL ที่นี่
   ⚡ Edge Functions          ← Deploy ที่นี่
   ⚙️  Project Settings
```

---

## 💡 Tips

1. **ทำทีละขั้นตอน** - อย่าข้ามขั้นตอนใด
2. **คลิก Save ทุกครั้ง** - หลังจากเปลี่ยนการตั้งค่า
3. **Refresh หน้าแอป** - หลังจาก Deploy Edge Function
4. **ใช้ Console** - กด F12 เพื่อดู error ละเอียด
5. **ใช้ Mock Data** - แอปทำงานได้โดยไม่ต้องมี OpenAI API Key

---

## 🎊 สำเร็จ!

ตอนนี้แอป FitFood AI ควรทำงานได้เต็มรูปแบบแล้ว! 🚀

ถ้ายังมีปัญหา กลับมาอ่านขั้นตอนนี้อีกครั้ง หรือตรวจสอบ Console เพื่อดู error message