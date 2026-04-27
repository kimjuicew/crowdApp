# 📚 Library Zones - ระบบติดตามที่นั่งแบบเรียลไทม์

## ✨ ฟีเจอร์ใหม่

ระบบติดตามที่นั่งแบบเรียลไทม์สำหรับ **หอสมุดป๋วย อึ้งภากรณ์** 

### 🎯 จุดเด่น

- ✅ แบ่งเป็น 2 โซน: Zone A (Silent Study) และ Zone B (Group Study)
- ✅ Real-time updates ข้อมูลอัพเดททันที
- ✅ แสดงที่นั่งว่าง, ที่นั่งมีคน, คนยืน/เดิน
- ✅ คำนวณเปอร์เซ็นต์การใช้งานอัตโนมัติ
- ✅ UI สวยงาม responsive ใช้งานง่าย
- ✅ Admin อัพเดทได้ แสดงผลให้ User เห็นทันที

---

## 🚀 Setup - รัน Migration

### 1. ไปที่ Supabase SQL Editor

```
https://supabase.com/dashboard/project/xqogrrdeepicusvryfud/sql/new
```

### 2. รันไฟล์ Migration

**คัดลอกไฟล์:**
```
supabase/migrations/003_add_seat_status.sql
```

**ขั้นตอน:**
1. กด Ctrl+A → Ctrl+C
2. วางลง SQL Editor
3. กด **RUN** (Ctrl+Enter)
4. เห็น "Success" ✅

**ผลลัพธ์:**
- ✅ สร้างตาราง `seat_status`
- ✅ เพิ่มข้อมูลเริ่มต้น 2 โซน
- ✅ ตั้งค่า triggers สำหรับ auto-update timestamp

---

## 👥 สำหรับ User - ดูข้อมูลที่นั่ง

### วิธีใช้งาน:

1. **Login เป็น User:**
   ```
   Username: user
   Password: user123
   ```

2. **เข้าดูหอสมุดป๋วย:**
   - คลิกที่ "หอสมุดป๋วย อึ้งภากรณ์" ใน Dashboard
   - เลื่อนลงมาจะเห็นส่วน **"ติดตามที่นั่งแบบเรียลไทม์"**

### สิ่งที่จะเห็น:

#### 📊 สรุปรวมทั้งหมด
```
+--------------------------------------------------+
| สรุปรวมทั้งหมด                  75% ใช้งาน | 🕐  |
+--------------------------------------------------+
|   ที่นั่งมีคน      ที่นั่งว่าง      คนยืน/เดิน   |
|       83              57              8         |
+--------------------------------------------------+
| ความหนาแน่น: [██████████████░░░░░░] ปานกลาง     |
+--------------------------------------------------+
```

#### 🏢 แต่ละโซน (2 โซน)

**Zone A - Silent Study:**
```
+---------------------------------------+
| 🪑 Zone A - Silent Study      60%   |
| 80 ที่นั่งทั้งหมด                     |
+---------------------------------------+
| มีคนนั่ง: 45    ที่ว่าง: 35          |
| คนยืน/เดิน: 3 คน                     |
| [██████████████░░░░░] ปานกลาง        |
| อัพเดท: 14:30:15                     |
+---------------------------------------+
```

**Zone B - Group Study:**
```
+---------------------------------------+
| 🪑 Zone B - Group Study       85%   |
| 60 ที่นั่งทั้งหมด                     |
+---------------------------------------+
| มีคนนั่ง: 38    ที่ว่าง: 22          |
| คนยืน/เดิน: 5 คน                     |
| [████████████████░░] เต็ม            |
| อัพเดท: 14:30:15                     |
+---------------------------------------+
```

### 🎨 สี Status

| สี    | สถานะ     | เงื่อนไข  |
|-------|-----------|-----------|
| 🟢    | ว่าง      | < 40%     |
| 🟠    | ปานกลาง   | 40-74%    |
| 🔴    | เต็ม      | ≥ 75%     |

---

## 🛠️ สำหรับ Admin - อัพเดทข้อมูล

### วิธีใช้งาน:

1. **Login เป็น Admin:**
   ```
   Username: admin
   Password: admin123
   ```

2. **ไปที่ Admin Dashboard:**
   - เลื่อนลงมาจะเห็น **"จัดการที่นั่งแบบเรียลไทม์"**
   - แสดงทั้ง 2 โซน

### การอัพเดทข้อมูล:

#### ขั้นตอน:

1. **เลือกโซนที่ต้องการแก้ไข**
   - คลิกปุ่ม **"แก้ไขข้อมูล"** ในโซนนั้น

2. **กรอกข้อมูล:**
   - **จำนวนที่นั่งมีคน:** เช่น 50
   - **จำนวนคนยืน/เดิน:** เช่น 3
   - ที่นั่งว่างจะคำนวณอัตโนมัติ

3. **บันทึก:**
   - กดปุ่ม **"บันทึก"**
   - เห็น toast "บันทึกข้อมูลสำเร็จ" ✅

4. **Real-time Update:**
   - ข้อมูลจะอัพเดททันทีใน UI
   - User ที่กำลังดูหน้านี้จะเห็นข้อมูลใหม่ทันที (ไม่ต้องรีเฟรช)

### ตัวอย่าง Admin Interface:

```
+-------------------------------------------------------+
| จัดการที่นั่งแบบเรียลไทม์                                |
| หอสมุดป๋วย - ระบบติดตามที่นั่ง 2 โซน                    |
+-------------------------------------------------------+

📍 Zone A - Silent Study                    [รีเฟรช]
+-------------------------------------------------------+
| 🪑 Zone A - Silent Study          60%                |
| 80 ที่นั่ง                                             |
+-------------------------------------------------------+
| มีคนนั่ง: 45         ที่ว่าง: 35                      |
| คนยืน/เดิน: 3 คน                                      |
| [██████████████░░░░░] ปานกลาง                        |
|                                     [แก้ไขข้อมูล]    |
| อัพเดทล่าสุด: 20/4/2026, 14:30:15                     |
+-------------------------------------------------------+

(กดแก้ไขข้อมูล)

+-------------------------------------------------------+
| จำนวนที่นั่งมีคน                                      |
| [  50  ] ← ที่ว่าง: 30 ที่                            |
|                                                       |
| จำนวนคนยืน/เดิน                                       |
| [  3   ]                                              |
|                                                       |
| [บันทึก]  [ยกเลิก]                                   |
+-------------------------------------------------------+
```

---

## 📊 Database Structure

### Table: `seat_status`

| Column           | Type      | Description                    |
|------------------|-----------|--------------------------------|
| id               | UUID      | Primary key                    |
| location_id      | TEXT      | FK to locations (หอสมุด id)    |
| zone_name        | TEXT      | ชื่อโซน (Zone A, Zone B)       |
| total_seats      | INTEGER   | ที่นั่งทั้งหมด                 |
| occupied_seats   | INTEGER   | ที่นั่งมีคน                    |
| available_seats  | INTEGER   | ที่นั่งว่าง (auto-calculate)   |
| standing_people  | INTEGER   | คนยืน/เดิน                     |
| updated_at       | TIMESTAMP | เวลาอัพเดทล่าสุด               |

### ข้อมูลเริ่มต้น:

```sql
-- Zone A
location_id: '1' (หอสมุดป๋วย)
zone_name: 'Zone A - Silent Study'
total_seats: 80
occupied_seats: 45
available_seats: 35
standing_people: 3

-- Zone B
location_id: '1'
zone_name: 'Zone B - Group Study'
total_seats: 60
occupied_seats: 38
available_seats: 22
standing_people: 5
```

---

## 🔄 Real-time Updates

### วิธีการทำงาน:

1. **Admin อัพเดทข้อมูล** → บันทึกลง `seat_status` table
2. **Supabase Realtime** → ส่ง notification ไปยัง subscribers
3. **User UI** → รับ notification แล้วโหลดข้อมูลใหม่ทันที
4. **ไม่ต้องรีเฟรช** → เห็นข้อมูลใหม่ทันที

### เทคนิค:

```typescript
// Subscribe to real-time changes
const channel = supabase
  .channel('seat_status_changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'seat_status',
      filter: `location_id=eq.1`
    },
    () => {
      fetchZones(); // Reload data
    }
  )
  .subscribe();
```

---

## 🎨 UI/UX Features

### 1. สีแบบไดนามิก
- สีเปลี่ยนตาม occupancy rate
- เขียว (ว่าง) → ส้ม (ปานกลาง) → แดง (เต็ม)

### 2. Progress Bars
- แสดงภาพรวมความหนาแน่น
- Animation smooth

### 3. Stats Cards
- แยกข้อมูลชัดเจน
- ใช้ไอคอนประกอบ
- สีพื้นหลังแบบ soft

### 4. Responsive Design
- Desktop: 2 คอลัมน์
- Mobile: 1 คอลัมน์
- ปรับขนาดอัตโนมัติ

### 5. Loading States
- แสดง spinner ขณะโหลด
- ป้องกัน click ซ้ำขณะบันทึก

---

## 🧪 ทดสอบ

### Test Case 1: User View
1. Login เป็น user
2. เข้า "หอสมุดป๋วย"
3. ✅ เห็น 2 โซน
4. ✅ เห็นตัวเลขที่นั่ง
5. ✅ เห็นสี status ถูกต้อง

### Test Case 2: Admin Update
1. Login เป็น admin
2. กดแก้ไข Zone A
3. เปลี่ยนเป็น 50 คน
4. กดบันทึก
5. ✅ เห็น toast "บันทึกสำเร็จ"
6. ✅ ตัวเลขเปลี่ยนทันที
7. ✅ สีเปลี่ยนถูกต้อง

### Test Case 3: Real-time Sync
1. เปิด 2 tabs
2. Tab 1: Login admin
3. Tab 2: Login user, เปิดหน้าหอสมุดป๋วย
4. Tab 1: แก้ไขข้อมูล
5. ✅ Tab 2 เห็นข้อมูลเปลี่ยนทันที (ไม่ต้องรีเฟรช)

### Test Case 4: Database Persistence
1. Admin แก้ไข Zone A เป็น 60
2. กดบันทึก
3. รีเฟรชหน้า
4. ✅ ยังเห็น 60 อยู่
5. ตรวจสอบ Supabase Table Editor
6. ✅ `occupied_seats` = 60

---

## 🐛 Troubleshooting

### ❌ ไม่เห็นข้อมูลโซน

**สาเหตุ:** ยังไม่รัน migration

**แก้ไข:**
```
รัน: supabase/migrations/003_add_seat_status.sql
```

### ❌ Admin แก้ไขแล้ว database ไม่อัพเดท

**สาเหตุ:** RLS อาจบล็อก (แต่น่าจะไม่เกิดเพราะเราปิด RLS แล้ว)

**แก้ไข:**
1. เปิด Console (F12)
2. ดู log มีแบบนี้หรือไม่:
   ```
   🔵 [AdminZoneManager] Updating zone: ...
   ✅ [AdminZoneManager] Zone updated successfully
   ```
3. ถ้าไม่มี → ส่ง error log มาให้ดู

### ❌ Real-time ไม่อัพเดท

**สาเหตุ:** Supabase Realtime ไม่เปิด

**แก้ไข:**
1. ไปที่ Supabase Dashboard
2. Database → Replication
3. เปิด Realtime สำหรับตาราง `seat_status`

---

## 📚 Files ที่เกี่ยวข้อง

### Migration:
- `supabase/migrations/003_add_seat_status.sql` - สร้างตาราง

### Components:
- `src/app/components/crowd/LibraryZones.tsx` - User view (แสดงข้อมูล)
- `src/app/components/crowd/AdminZoneManager.tsx` - Admin interface (แก้ไข)
- `src/app/components/crowd/LocationDetail.tsx` - แสดง LibraryZones
- `src/app/components/crowd/AdminDashboard.tsx` - แสดง AdminZoneManager

---

## ✅ Checklist

- [ ] รัน migration `003_add_seat_status.sql`
- [ ] ตรวจสอบ Supabase Table Editor มีตาราง `seat_status`
- [ ] Login user → เข้าหอสมุดป๋วย → เห็น 2 โซน
- [ ] Login admin → เห็น section "จัดการที่นั่งแบบเรียลไทม์"
- [ ] Admin แก้ไขข้อมูล → บันทึกสำเร็จ
- [ ] รีเฟรช → ข้อมูลยังอยู่
- [ ] เปิด 2 tabs → แก้ไขใน tab 1 → tab 2 อัพเดททันที

---

**🎉 ระบบ Library Zones พร้อมใช้งาน!**

แสดงที่นั่งแบบเรียลไทม์ด้วย UI สวยงาม อัพเดทง่าย sync ทันที 🚀
