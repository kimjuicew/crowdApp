# 🔧 แก้ปัญหา "Email logins are disabled"

## ⚠️ ปัญหา

```
AuthApiError: Email logins are disabled
```

## ✅ วิธีแก้ไข (เปิด Email Authentication)

### ขั้นตอนที่ 1: เปิด Email Provider

1. ไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
2. เลือก Project ของคุณ
3. ไปที่ **Authentication** (เมนูด้านซ้าย)
4. คลิก **Providers**
5. ค้นหา **Email**
6. **เปิดใช้งาน (Enable)** Email Provider:

```
☑️ Enable Email provider
```

7. คลิก **Save**

### ขั้นตอนที่ 2: ตั้งค่า Email Authentication

1. ไปที่ **Authentication** > **Settings**
2. ตรวจสอบการตั้งค่าดังนี้:

```
☑️ Enable Email Signup
☐ Confirm Email (ยกเลิกเครื่องหมาก - เพื่อไม่ต้องยืนยันอีเมล)
☑️ Enable Auto Confirm (ถ้ามี)
```

3. คลิก **Save**

### ขั้นตอนที่ 3: ตรวจสอบ Site URL

1. ไปที่ **Authentication** > **URL Configuration**
2. ตรวจสอบว่ามี **Site URL** ถูกต้อง:

```
Site URL: https://titqznaxipkpiifdtayn.supabase.co
หรือ: https://your-app-domain.com (ถ้ามี custom domain)
```

3. เพิ่ม **Redirect URLs** (ถ้าจำเป็น):

```
http://localhost:5173
https://your-app-domain.com
```

4. คลิก **Save**

---

## 🧹 ลบ User เก่า (ถ้ามี error "User already registered")

### วิธีที่ 1: ลบผ่าน Dashboard (แนะนำ)

1. ไปที่ **Authentication** > **Users**
2. ค้นหา user ที่ต้องการลบ
3. คลิก **...** (จุด 3 จุด)
4. คลิก **Delete user**
5. ยืนยันการลบ

### วิธีที่ 2: ลบผ่าน SQL Editor

1. ไปที่ **SQL Editor**
2. รันคำสั่ง:

```sql
-- ลบ user ทั้งหมด (ระวัง! จะลบทุก user)
DELETE FROM auth.users;

-- หรือลบ user เฉพาะอีเมล
DELETE FROM auth.users WHERE email = 'your@email.com';
```

3. คลิก **Run**

---

## ✅ ทดสอบอีกครั้ง

หลังจากทำตามขั้นตอนแล้ว:

1. **Refresh** หน้าแอป
2. ลองสมัครสมาชิกใหม่
3. ลองเข้าสู่ระบบ

ควรจะทำงานได้ปกติแล้ว! 🎉

---

## 🚨 ถ้ายังไม่ได้

ลองรันคำสั่ง SQL นี้:

```sql
-- ตรวจสอบว่ามี user อยู่หรือไม่
SELECT email, created_at FROM auth.users;

-- ลบทุก user (ระวัง!)
TRUNCATE auth.users CASCADE;
```

หลังจากนั้นลองสมัครสมาชิกใหม่อีกครั้ง

---

## 🔧 แก้ปัญหา Deploy Error 403

ถ้าพบ error:
```
Error while deploying: XHR for "/api/integrations/supabase/.../edge_functions/make-server/deploy" failed with status 403
```

### วิธีแก้:

1. **Redeploy ผ่าน Supabase Dashboard:**
   - ไปที่ **Supabase Dashboard** > **Edge Functions**
   - เลือก `make-server-e5c31e4c`
   - คลิก **...** (จุด 3 จุด) > **Deploy**
   - รอจนกว่า deploy สำเร็จ

2. **ตรวจสอบ Permissions:**
   - ตรวจสอบว่าคุณมีสิทธิ์ deploy Edge Functions
   - ตรวจสอบว่า Project ไม่ได้ถูกระงับ (suspended)

3. **ลอง Refresh:**
   - กด **Ctrl+Shift+R** (หรือ Cmd+Shift+R บน Mac) เพื่อ hard refresh
   - ล้าง cache ของเบราว์เซอร์
   - ลองใหม่อีกครั้ง

---

## 📝 สรุปขั้นตอนที่ต้องทำ

1. ✅ เปิด Email Provider ใน Authentication > Providers
2. ✅ Enable Email Signup
3. ✅ ยกเลิก Confirm Email
4. ✅ ตั้งค่า Site URL
5. ✅ ลบ User เก่า (ถ้ามี duplicate)
6. ✅ Redeploy Edge Function
7. ✅ ทดสอบ Signup ใหม่
8. ✅ ทดสอบ Login