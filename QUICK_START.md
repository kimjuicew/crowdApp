# 🚀 QUICK START - เริ่มใช้งาน CrowdWatch ใน 3 ขั้นตอน

## ⚡ ขั้นตอนที่ 1: Setup Database (5 นาที)

### 1.1 เปิด Supabase SQL Editor
คลิกลิงก์นี้: https://supabase.com/dashboard/project/xqogrrdeepicusvryfud/sql/new

### 1.2 รัน SQL Migration
1. เปิดไฟล์ `supabase/migrations/001_initial_schema_clean.sql`
2. **กด Ctrl+A** เพื่อเลือกทั้งหมด
3. **กด Ctrl+C** เพื่อคัดลอก
4. วางลงใน SQL Editor ของ Supabase
5. **กดปุ่ม RUN** (หรือ Ctrl+Enter)

### 1.3 ตรวจสอบว่าสำเร็จ
1. ไปที่ Table Editor: https://supabase.com/dashboard/project/xqogrrdeepicusvryfud/editor
2. ควรเห็น 3 ตาราง:
   - ✅ **users** (3 rows) - ข้อมูลผู้ใช้
   - ✅ **locations** (6 rows) - ข้อมูลสถานที่
   - ✅ **user_favorites** (0 rows) - รายการโปรด

**ถ้าเห็นครบทั้ง 3 ตาราง = สำเร็จ! 🎉**

---

## ⚡ ขั้นตอนที่ 2: ทดสอบการใช้งาน (2 นาที)

### 2.1 เปิดแอพ
แอพจะเปิดอยู่แล้วใน Figma Make preview

### 2.2 Login ด้วย Demo Account

**ผู้ใช้ทั่วไป:**
```
Username: user
Password: user123
```

**ผู้ดูแลระบบ:**
```
Username: admin
Password: admin123
```

### 2.3 ทดสอบ Features

✅ **ดูสถานที่ทั้งหมด**
- หน้า Dashboard จะแสดงการ์ดของสถานที่ 6 แห่ง
- แต่ละการ์ดแสดงสถานะ: ว่าง (เขียว) / ปานกลาง (ส้ม) / แน่น (แดง)

✅ **กรองตามหมวดหมู่**
- กดปุ่ม "All", "Library", "Fitness", etc. ด้านบน
- สถานที่จะถูกกรองตามหมวดหมู่

✅ **ดูรายละเอียดสถานที่**
- คลิกที่การ์ดสถานที่ใดก็ได้
- จะเห็นกราฟความหนาแน่นตลอดวัน

✅ **เพิ่มสถานที่โปรด (⭐)**
- คลิกปุ่มดาว หรือ กด "ติดตามสถานที่"
- ข้อมูลจะถูกบันทึกลง Supabase
- Toast notification จะขึ้นมาว่า "เพิ่มลงรายการโปรดแล้ว"

✅ **เปิดการแจ้งเตือน (🔔)**
- คลิกปุ่มกระดิ่ง หรือ กด "เปิดการแจ้งเตือน"
- ข้อมูลจะถูกบันทึกลง Supabase
- Toast notification จะขึ้นมาว่า "เปิดการแจ้งเตือนแล้ว"

✅ **ดูสถานที่โปรด**
- ไปที่ Profile (กดไอคอนโปรไฟล์มุมบนขวา)
- จะเห็นส่วน "สถานที่โปรดของคุณ" แสดงสถานที่ที่คุณติดตามไว้

✅ **แก้ไขข้อมูลส่วนตัว**
- ในหน้า Profile กด "แก้ไขข้อมูลส่วนตัว"
- แก้ไขชื่อ, อีเมล, เบอร์โทร
- กด "บันทึกการเปลี่ยนแปลง"
- ข้อมูลจะถูกบันทึกลง Supabase

---

## ⚡ ขั้นตอนที่ 3: Commit & Push to Git (2 นาที)

### 3.1 Commit การเปลี่ยนแปลง

เปิด Terminal และรันคำสั่ง:

```bash
cd /workspaces/default/code

# ดูการเปลี่ยนแปลง
git status

# Commit ไฟล์ใหม่
git add .
git commit -m "Fix chart duplicate keys warning

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 3.2 Push to GitHub/GitLab

**ครั้งแรก - เชื่อมต่อ Remote Repository:**

```bash
# สร้าง repo ใหม่บน GitHub หรือ GitLab ก่อน
# แล้วรันคำสั่งนี้ (แทน URL ด้วย URL ของคุณ)

git remote add origin https://github.com/YOUR_USERNAME/crowdwatch.git
git branch -M main
git push -u origin main
```

**ครั้งต่อไป - Push เฉยๆ:**

```bash
git push
```

---

## 📊 สิ่งที่มีใน Database

### Users (3 accounts)
1. `user` / `user123` - ผู้ใช้ทั่วไป
2. `admin` / `admin123` - ผู้ดูแลห้องสมุด
3. `admin2` / `admin123` - ผู้ดูแลโรงอาหาร

### Locations (6 สถานที่)
1. **หอสมุดป๋วย อึ้งภากรณ์** - หอสมุด (ว่าง)
2. **TU ฟิตเนส** - ฟิตเนส (แน่น)
3. **โรงอาหาร JC** - โรงอาหาร (ปานกลาง)
4. **ห้องคอมคณะวิศวะ ชั้น 2** - ห้องคอมพิวเตอร์ (ว่าง)
5. **สระว่ายน้ำ** - ศูนย์กีฬา (ปานกลาง)
6. **หอสมุดป๋วยชั้น 2** - หอสมุด (ว่าง)

---

## ✅ Checklist - ตรวจสอบว่าทำครบ

- [ ] รัน SQL migration ใน Supabase
- [ ] เห็น 3 ตาราง (users, locations, user_favorites)
- [ ] Login ได้ด้วย user/user123
- [ ] เห็นสถานที่ 6 แห่งในหน้า Dashboard
- [ ] กดปุ่มกรองหมวดหมู่ได้
- [ ] เข้าดูรายละเอียดสถานที่ได้
- [ ] กดปุ่ม ⭐ Favorite ได้และมี toast notification
- [ ] กดปุ่ม 🔔 Notification ได้และมี toast notification
- [ ] ไปหน้า Profile เห็นสถานที่โปรด
- [ ] แก้ไขข้อมูลส่วนตัวได้
- [ ] Commit to git
- [ ] Push to GitHub/GitLab

---

## 🆘 Troubleshooting

### ❌ Dashboard ว่างเปล่า
**สาเหตุ:** ยังไม่รัน migration หรือรันไม่สำเร็จ

**แก้ไข:**
1. ไปที่ Table Editor ตรวจสอบว่ามีตาราง `locations` หรือไม่
2. ถ้าไม่มี → รัน migration ใหม่อีกครั้ง
3. ถ้ามีแต่ไม่มีข้อมูล → ลบตารางและรัน migration ใหม่

### ❌ Login ไม่ได้
**สาเหตุ:** ตาราง `users` ไม่มีข้อมูล

**แก้ไข:**
1. ตรวจสอบตาราง `users` ใน Table Editor
2. ควรมี 3 rows (user, admin, admin2)
3. ถ้าไม่มี → รัน migration ใหม่

### ❌ กดปุ่ม Favorite/Notification แล้วไม่มีอะไรเกิดขึ้น
**สาเหตุ:** ยังไม่ login หรือ localStorage ไม่มี userId

**แก้ไข:**
1. Logout แล้ว Login ใหม่
2. เปิด Browser Console (F12) ดู error
3. ตรวจสอบ localStorage ว่ามี userId หรือไม่

### ❌ Warning: duplicate keys ใน Console
**สาเหตุ:** แก้ไขไฟล์ LocationDetail.tsx แล้ว

**แก้ไข:**
- ไฟล์ถูกแก้ไขแล้ว ให้ refresh หน้าเว็บ

---

## 🎯 Summary

คุณมีแอพ CrowdWatch ที่:
- ✅ เชื่อมต่อ Supabase Database
- ✅ Login/Sign Up ได้
- ✅ ดูความหนาแน่นสถานที่แบบเรียลไทม์
- ✅ เพิ่มสถานที่โปรด
- ✅ เปิดการแจ้งเตือน
- ✅ แก้ไขข้อมูลส่วนตัว
- ✅ พร้อม commit และ push to Git

**🎉 พร้อมใช้งาน 100%!**

---

## 📞 Need Help?

อ่านเอกสารเพิ่มเติม:
- `README.md` - คู่มือครบถ้วน
- `RUN_THIS_FIRST.md` - คำแนะนำโดยละเอียด
- `SUPABASE_SETUP.md` - คู่มือ Supabase
- `GIT_SETUP.md` - คำแนะนำ Git
