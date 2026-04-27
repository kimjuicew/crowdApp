# ⚡ ทำตามนี้เลย - แก้ "Database ไม่อัปเดต"

## 🎯 ปัญหา: Admin แก้ไข → UI เปลี่ยน → รีเฟรช → กลับเป็นเดิม

## ✅ แก้ไข - 2 นาที

### 1. เปิดลิงก์นี้:
```
https://supabase.com/dashboard/project/xqogrrdeepicusvryfud/sql/new
```

### 2. คัดลอกไฟล์นี้:
```
supabase/migrations/002_fix_rls_policies.sql
```
(กด Ctrl+A → Ctrl+C)

### 3. วางและกด RUN

เห็น "Success" = เสร็จ!

---

## 🧪 ทดสอบ

1. Login: `admin / admin123`
2. เลือก "หอสมุดป๋วย"
3. กด "แก้ไขจำนวนคน"
4. เปลี่ยนเป็น **88**
5. กด "บันทึก"
6. กด **F5**
7. ดูมุมล่างขวา → **ยังเป็น 88!** ✅

---

## 📝 สาเหตุ (สั้นๆ)

RLS Policy บล็อกการอัปเดตเพราะไม่มี Supabase Auth Session

Migration นี้จะปิด RLS → admin อัปเดตได้แล้ว

---

## 📚 อ่านเพิ่ม

- `ADMIN_DATABASE_FIX_SUMMARY.md` - รายละเอียดเต็ม
- `START_HERE.md` - Setup ทั้งระบบ

---

**🚀 รัน migration เลย!**
