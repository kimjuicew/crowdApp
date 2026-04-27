# 📝 Admin Dashboard - คู่มือการอัปเดตข้อมูล

## ✅ ตอนนี้ใช้งานได้แล้ว!

เมื่อ Admin อัปเดตข้อมูลสถานที่ ข้อมูลจะถูก**บันทึกลง Supabase Database** และ**คงอยู่ถาวร** แม้จะรีเฟรชหน้าเว็บ

---

## 🎯 วิธีการทำงาน

### 1️⃣ Login เป็น Admin
```
Username: admin
Password: admin123
```

### 2️⃣ เห็นสถานที่ที่รับผิดชอบ
- Admin แต่ละคนจะเห็นเฉพาะสถานที่ที่ตัวเองดูแล
- `admin` ดูแล: หอสมุดป๋วย, TU ฟิตเนส, สระว่ายน้ำ
- `admin2` ดูแล: โรงอาหาร JC, ห้องคอมคณะวิศวะ

### 3️⃣ แก้ไขจำนวนคน
1. กดปุ่ม **"แก้ไขจำนวนคน"**
2. แก้ไขตัวเลขได้ 2 ค่า:
   - **จำนวนคนปัจจุบัน** (0 - ความจุ)
   - **ความจุ** (ต้องมากกว่า 0)
3. กดปุ่ม **"บันทึก"**

### 4️⃣ ระบบจะทำงานอัตโนมัติ
- ✅ บันทึกข้อมูลลง Supabase Database
- ✅ คำนวณ density level ใหม่ (low/medium/high)
  - **low** (ว่าง): < 40% ของความจุ
  - **medium** (ปานกลาง): 40-74% ของความจุ
  - **high** (แน่น): ≥ 75% ของความจุ
- ✅ อัปเดต UI ทันที
- ✅ แสดง toast notification "บันทึกข้อมูลสำเร็จ"

### 5️⃣ รีเฟรชหน้าเว็บ
- ข้อมูลที่แก้ไขจะ**ยังคงอยู่**
- ไม่กลับไปเป็นค่า default
- ผู้ใช้ทั่วไปจะเห็นข้อมูลที่อัปเดตแล้ว

---

## 🔧 การทำงานภายใน (Technical)

### Flow การอัปเดต:

```
1. Admin กดบันทึก
   ↓
2. AdminDashboard.tsx → handleSave()
   ↓
3. LocationContext → updateLocationCount() / updateLocationCapacity()
   ↓
4. Supabase → UPDATE locations SET current_count=X, current_density='low'
   ↓
5. Local State → อัปเดต UI ทันที
   ↓
6. Toast → แสดง "บันทึกข้อมูลสำเร็จ"
```

### Database Update:

```sql
-- เมื่ออัปเดตจำนวนคน
UPDATE locations 
SET 
  current_count = <new_count>,
  current_density = <calculated_density>,
  updated_at = NOW()
WHERE id = <location_id>;

-- เมื่ออัปเดตความจุ
UPDATE locations 
SET 
  capacity = <new_capacity>,
  current_count = MIN(current_count, <new_capacity>),
  current_density = <calculated_density>,
  updated_at = NOW()
WHERE id = <location_id>;
```

---

## ✅ การตรวจสอบว่าทำงาน

### ทดสอบ 1: อัปเดตและรีเฟรช
1. Login เป็น admin
2. แก้ไขจำนวนคนที่ "หอสมุดป๋วย" เป็น 50
3. กดบันทึก
4. **รีเฟรชหน้าเว็บ** (F5)
5. ✅ ควรเห็นจำนวน 50 ยังคงอยู่

### ทดสอบ 2: User เห็นข้อมูลอัปเดต
1. Login เป็น admin
2. แก้ไข "TU ฟิตเนส" จาก 75 เป็น 20
3. กดบันทึก
4. Logout
5. Login เป็น user
6. ดู "TU ฟิตเนส"
7. ✅ ควรเห็นจำนวน 20 และสถานะ "ว่าง"

### ทดสอบ 3: Density Auto-calculate
1. ตั้งความจุ = 100
2. ตั้งจำนวนคน = 30
3. ✅ สถานะควรเป็น "ว่าง" (เขียว)
4. เปลี่ยนเป็น 50
5. ✅ สถานะควรเป็น "ปานกลาง" (ส้ม)
6. เปลี่ยนเป็น 80
7. ✅ สถานะควรเป็น "แน่น" (แดง)

### ทดสอบ 4: ตรวจสอบ Database
1. ไปที่ Supabase Table Editor
2. เปิดตาราง `locations`
3. ดูแถวที่มี `id = '1'` (หอสมุดป๋วย)
4. ✅ `current_count`, `current_density`, `updated_at` ควรเป็นค่าที่เพิ่งแก้ไข

---

## 🔐 Security & Permissions

### Row Level Security (RLS)
- ✅ Admin เท่านั้นที่อัปเดตข้อมูลได้
- ✅ User ทั่วไปอ่านได้อย่างเดียว
- ✅ ตรวจสอบ role ก่อนอนุญาต

### Policy:
```sql
CREATE POLICY "Admins can update locations" ON locations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );
```

---

## 🐛 Troubleshooting

### ❌ แก้ไขแล้วกดบันทึก แต่ไม่เปลี่ยน
**สาเหตุ:** อาจมี error ใน Supabase

**แก้ไข:**
1. เปิด Browser Console (F12)
2. ดู error messages
3. ตรวจสอบว่า Supabase migration รันสำเร็จแล้ว
4. ตรวจสอบว่าตาราง `locations` มีข้อมูล

### ❌ รีเฟรชแล้วข้อมูลหาย
**สาเหตุ:** ข้อมูลไม่ถูกบันทึกลง Supabase

**แก้ไข:**
1. ตรวจสอบ Console ว่ามี "Error updating location" หรือไม่
2. ตรวจสอบ Network tab ว่ามี API call ไป Supabase หรือไม่
3. ตรวจสอบ RLS policies ว่าอนุญาตให้ admin อัปเดตหรือไม่

### ❌ Toast "เกิดข้อผิดพลาดในการบันทึก"
**สาเหตุ:** Supabase connection error

**แก้ไข:**
1. ตรวจสอบ internet connection
2. ตรวจสอบ Supabase project status
3. ตรวจสอบ API keys ใน `src/lib/supabase.ts`

---

## 📊 ข้อมูลเพิ่มเติม

### Density Calculation Logic:
```typescript
export const calculateDensity = (count: number, capacity: number): CrowdLevel => {
  const percentage = (count / capacity) * 100;
  if (percentage < 40) return 'low';      // ว่าง
  if (percentage < 75) return 'medium';   // ปานกลาง
  return 'high';                          // แน่น
};
```

### Admin-Location Mapping:
```typescript
// ใน database: locations.admin_id
'admin1' → ['1', '2', '5']  // หอสมุด, ฟิตเนส, สระ
'admin2' → ['3', '4']        // โรงอาหาร, ห้องคอม
```

---

## ✨ Features

✅ **Real-time Update** - อัปเดตข้อมูลทันที
✅ **Persistent Storage** - บันทึกลง Database ถาวร
✅ **Auto-calculate Density** - คำนวณสถานะอัตโนมัติ
✅ **Toast Notifications** - แจ้งเตือนเมื่อบันทึกสำเร็จ
✅ **Loading States** - แสดง "กำลังบันทึก..." ขณะรอ
✅ **Validation** - ตรวจสอบข้อมูลก่อนบันทึก
✅ **Error Handling** - แจ้งเตือนเมื่อเกิด error

---

**🎉 ตอนนี้ Admin Dashboard พร้อมใช้งาน 100%!**

ข้อมูลที่แก้ไขจะถูกบันทึกลง Supabase และคงอยู่ถาวร ✨
