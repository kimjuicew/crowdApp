# ⚡ START HERE - เริ่มที่นี่!

## 🎯 ทำตามนี้เพื่อให้แอพพร้อมใช้งาน

### 1️⃣ Setup Database (5 นาที)

**ไปที่:** https://supabase.com/dashboard/project/xqogrrdeepicusvryfud/sql/new

**ทำ:**
1. เปิดไฟล์ `supabase/migrations/001_initial_schema_clean.sql`
2. คัดลอกทั้งหมด (Ctrl+A, Ctrl+C)
3. วางลงใน SQL Editor
4. กด **RUN**

**ผลลัพธ์:** ควรเห็น 3 ตาราง
- ✅ users (3 rows)
- ✅ locations (6 rows)
- ✅ user_favorites (0 rows)

---

### 1.5️⃣ แก้ไข RLS Policies (1 นาที) ⚠️ สำคัญ!

**ทำไมต้องทำ:** ไม่งั้น admin แก้ไขแล้ว database จะไม่อัปเดต!

**ไปที่:** https://supabase.com/dashboard/project/xqogrrdeepicusvryfud/sql/new

**ทำ:**
1. เปิดไฟล์ `supabase/migrations/002_fix_rls_policies.sql`
2. คัดลอกทั้งหมด (Ctrl+A, Ctrl+C)
3. วางลงใน SQL Editor
4. กด **RUN**

**ผลลัพธ์:** ควรเห็น "Success. No rows returned"

**อ่านรายละเอียด:** `PROBLEM_SOLVED.md` หรือ `FIX_DATABASE_UPDATE.md`

---

### 1.6️⃣ เพิ่ม Library Zones (1 นาที) ✨ ใหม่!

**ฟีเจอร์:** ระบบติดตามที่นั่งแบบเรียลไทม์สำหรับหอสมุดป๋วย (2 โซน)

**ไปที่:** https://supabase.com/dashboard/project/xqogrrdeepicusvryfud/sql/new

**ทำ:**
1. เปิดไฟล์ `supabase/migrations/003_add_seat_status.sql`
2. คัดลอกทั้งหมด (Ctrl+A, Ctrl+C)
3. วางลงใน SQL Editor
4. กด **RUN**

**ผลลัพธ์:** ควรเห็น "Success" และสร้างตาราง `seat_status`

**อ่านรายละเอียด:** `LIBRARY_ZONES_GUIDE.md`

---

### 2️⃣ ทดสอบ User (2 นาที)

**Login:**
```
Username: user
Password: user123
```

**ทดสอบ:**
- ✅ เห็นสถานที่ 6 แห่งในหน้า Dashboard
- ✅ คลิกดูรายละเอียดสถานที่
- ✅ กดปุ่ม ⭐ (Favorite) - ต้องมี toast "เพิ่มลงรายการโปรดแล้ว"
- ✅ กดปุ่ม 🔔 (Notification) - ต้องมี toast "เปิดการแจ้งเตือนแล้ว"
- ✅ ไปหน้า Profile เห็นสถานที่โปรด
- ✅ แก้ไขข้อมูลส่วนตัวได้

---

### 2.5️⃣ ทดสอบ Admin - Database Update (2 นาที) ⚠️ สำคัญ!

**Logout แล้ว Login เป็น Admin:**
```
Username: admin
Password: admin123
```

**ทดสอบ:**
1. เลือก "หอสมุดป๋วย"
2. กด "แก้ไขจำนวนคน"
3. เปลี่ยนเป็น **88**
4. กด "บันทึก"
5. เห็น toast "บันทึกข้อมูลสำเร็จ" ✅
6. ดู Debug Panel มุมล่างขวา → ควรเห็น "88"
7. **กด F5 รีเฟรช**
8. ดู Debug Panel อีกครั้ง → **ยังเห็น 88 อยู่!** ✅

**ถ้ารีเฟรชแล้วกลับเป็นเลขเดิม:** migration ขั้นตอน 1.5 ยังไม่รัน!

---

### 3️⃣ Commit to Git (2 นาที)

```bash
cd /workspaces/default/code
git add .
git commit -m "Fix chart duplicate keys and add quick start guide"
```

**Push to GitHub/GitLab:**
```bash
# สร้าง repo ก่อน แล้วรัน
git remote add origin YOUR_REPO_URL
git branch -M main
git push -u origin main
```

---

## ✅ เสร็จแล้ว!

อ่านคู่มือเพิ่มเติม:
- **QUICK_START.md** - คู่มือละเอียด
- **README.md** - เอกสารครบถ้วน

**🎉 แอพพร้อมใช้งาน 100%!**
