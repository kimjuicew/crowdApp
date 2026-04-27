# 🪑 CrowdWatch Seat Tracking System - คู่มือฉบับสมบูรณ์

## 📌 ภาพรวมระบบ

ระบบติดตามที่นั่งแบบเรียลไทม์สำหรับ **หอสมุดป๋วย อึ้งภากรณ์ ชั้น 2** ของมหาวิทยาลัยธรรมศาสตร์

### คุณสมบัติหลัก:
- ✅ ตรวจจับคนนั่ง/ยืนด้วย AI (YOLO Pose Detection)
- ✅ อัพเดทข้อมูลทุก 30 วินาทีอัตโนมัติ
- ✅ แสดงผลแบบเรียลไทม์ใน React app
- ✅ Admin สามารถแก้ไขข้อมูลด้วยตนเองได้
- ✅ รองรับ 2 โซน: Silent Study และ Group Study

---

## 🏗️ สถาปัตยกรรมระบบ

```
┌──────────────────────────────────────────────────────────────┐
│                    Python AI System                          │
│  ┌────────────────┐              ┌────────────────┐          │
│  │   Video 1      │              │   Video 2      │          │
│  │   Zone A       │              │   Zone B       │          │
│  │   (80 seats)   │              │   (60 seats)   │          │
│  └────────┬───────┘              └────────┬───────┘          │
│           │                               │                  │
│  ┌────────▼───────────────────────────────▼───────┐          │
│  │         YOLO Pose Detection                    │          │
│  │  • ตรวจจับคน (sitting/standing)                 │          │
│  │  • ตรวจจับเก้าอี้ (chair detection)             │          │
│  │  • นับจำนวนที่นั่งว่าง/มีคน                    │          │
│  └────────┬───────────────────────────────────────┘          │
│           │ ส่งข้อมูลทุก 30 วินาที                          │
└───────────┼──────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────┐
│                  Supabase Database                           │
│  ┌────────────────────────────────────────────────────┐      │
│  │  Table: seat_status                                │      │
│  │  ┌─────────────────────────────────────────────┐   │      │
│  │  │ id: UUID                                    │   │      │
│  │  │ location_id: "1" (หอสมุดป๋วย)                │   │      │
│  │  │ zone_name: "Zone A - Silent Study"          │   │      │
│  │  │ total_seats: 80                             │   │      │
│  │  │ occupied_seats: 45                          │   │      │
│  │  │ available_seats: 35                         │   │      │
│  │  │ standing_people: 3                          │   │      │
│  │  │ updated_at: timestamp                       │   │      │
│  │  └─────────────────────────────────────────────┘   │      │
│  │  UNIQUE(location_id, zone_name)                    │      │
│  └────────────────────────────────────────────────────┘      │
└───────────┬──────────────────────────────────────────────────┘
            │ Realtime Subscription
            ▼
┌──────────────────────────────────────────────────────────────┐
│                    React App (Figma)                         │
│  ┌──────────────────────┐  ┌──────────────────────┐          │
│  │   User Dashboard     │  │  Admin Dashboard     │          │
│  │                      │  │                      │          │
│  │  LibraryZones        │  │  AdminZoneManager    │          │
│  │  - แสดงข้อมูล RT     │  │  - แก้ไขข้อมูล      │          │
│  │  - กราฟสถิติ         │  │  - บันทึกลง DB       │          │
│  │  - สถานะว่าง/เต็ม    │  │  - ตั้งค่าโซน       │          │
│  └──────────────────────┘  └──────────────────────┘          │
└──────────────────────────────────────────────────────────────┘
```

---

## 📁 ไฟล์สำคัญ

### Backend (Supabase)
- `/supabase/migrations/001_initial_schema_clean.sql` - สร้าง tables: users, locations, user_favorites
- `/supabase/migrations/002_fix_rls_policies.sql` - ปิด RLS เพื่อให้ admin แก้ไขได้
- `/supabase/migrations/003_add_seat_status.sql` - สร้าง table seat_status สำหรับติดตามที่นั่ง

### Frontend (React)
- `/src/app/components/crowd/LibraryZones.tsx` - แสดงข้อมูลที่นั่งสำหรับ User (read-only)
- `/src/app/components/crowd/AdminZoneManager.tsx` - แก้ไขข้อมูลสำหรับ Admin (edit mode)
- `/src/lib/supabase.ts` - Supabase client configuration

### AI System (Python)
- `/python_script_fixed.py` - ✅ Python script ที่แก้ไขแล้ว (ใช้ไฟล์นี้)
- `/src/imports/pasted_text/pose-tracking-utils-1.txt` - ❌ Script เก่า (อย่าใช้)

### Documentation
- `/COMPLETE_FIX_GUIDE.md` - ⭐ คู่มือแก้ไขปัญหาครบถ้วน (อ่านก่อน!)
- `/PYTHON_INTEGRATION_FIX.md` - วิธีแก้ Python script
- `/FIX_DATABASE_UPDATE.md` - วิธีแก้ RLS policies
- `/SEAT_TRACKING_README.md` - 📄 ไฟล์นี้

---

## 🚀 วิธีใช้งาน

### 1️⃣ Setup Database (ครั้งแรกเท่านั้น)

**1.1 ไปที่ Supabase SQL Editor:**
```
https://supabase.com/dashboard/project/xqogrrdeepicusvryfud/sql/new
```

**1.2 รัน Migrations ตามลำดับ:**

```sql
-- 1. รัน 001_initial_schema_clean.sql
-- (สร้าง users, locations, user_favorites)

-- 2. รัน 002_fix_rls_policies.sql
-- (แก้ไข RLS policies)

-- 3. รัน 003_add_seat_status.sql
-- (สร้าง seat_status table)
```

**1.3 ตรวจสอบว่าสำเร็จ:**

```sql
-- ควรเห็น 2 แถว
SELECT * FROM seat_status WHERE location_id = '1';
```

---

### 2️⃣ รัน Python AI System

**2.1 ติดตั้ง Dependencies:**

```bash
pip install ultralytics opencv-python supabase-py
```

**2.2 เตรียมไฟล์:**

- ✅ YOLO models: `yolov8n-pose.pt`, `best.pt`
- ✅ Video files: `vid1.mp4`, `vid2.mp4`
- ✅ Python script: `python_script_fixed.py`

**2.3 แก้ไข paths ในไฟล์:**

```python
# แก้ path ให้ตรงกับเครื่องคุณ
detect_model_1 = YOLO(r"C:\path\to\your\best.pt")
t1 = threading.Thread(target=run_video, args=(
    r"C:\path\to\your\vid1.mp4",
    # ...
))
```

**2.4 รัน Script:**

```bash
python python_script_fixed.py
```

**2.5 ผลลัพธ์ที่ควรเห็น:**

```
====================================================
CrowdWatch - Seat Tracking System
Fixed version for Supabase Integration
====================================================

📦 Loading YOLO models...
✅ Models loaded successfully

🎥 Starting video processing threads...
   Zone A: Silent Study (80 seats)
   Zone B: Group Study (60 seats)

⏳ Processing videos... (Press ESC to stop)
📊 Data will be sent to Supabase every 30 seconds

✅ [Zone A - Silent Study] Sent: occupied=45, available=35, standing=3
✅ [Zone B - Group Study] Sent: occupied=38, available=22, standing=5
```

---

### 3️⃣ ใช้งาน React App

**User View (ดูข้อมูล):**

1. Login เป็น User:
   - Username: `user`
   - Password: `user123`

2. เลือก "หอสมุดป๋วย อึ้งภากรณ์"

3. เลื่อนลงไปที่ **"ข้อมูลที่นั่งแบบเรียลไทม์"**

4. เห็นข้อมูล 2 โซน:
   - Zone A - Silent Study (80 ที่)
   - Zone B - Group Study (60 ที่)

5. ข้อมูลจะอัพเดทอัตโนมัติทุก 30 วินาที

**Admin View (แก้ไขข้อมูล):**

1. Login เป็น Admin:
   - Username: `admin`
   - Password: `admin123`

2. ไปที่ Admin Dashboard

3. เลือก "หอสมุดป๋วย อึ้งภากรณ์"

4. เห็นส่วน **"จัดการข้อมูลโซนที่นั่ง"**

5. กดปุ่ม "แก้ไขข้อมูล" ที่โซนที่ต้องการ

6. เปลี่ยนค่า:
   - จำนวนที่นั่งมีคน
   - จำนวนคนยืน/เดิน

7. กดปุ่ม "บันทึก"

8. ✅ ข้อมูลจะถูกบันทึกลง database ทันที

9. User ที่กำลังดูหน้ารายละเอียดจะเห็นการอัพเดทแบบเรียลไทม์

---

## 🔧 Schema Database

### Table: seat_status

```sql
CREATE TABLE seat_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id TEXT NOT NULL,           -- "1" = หอสมุดป๋วย
  zone_name TEXT NOT NULL,             -- "Zone A - Silent Study" หรือ "Zone B - Group Study"
  total_seats INTEGER NOT NULL,        -- จำนวนที่นั่งทั้งหมด (80 หรือ 60)
  occupied_seats INTEGER NOT NULL,     -- จำนวนที่นั่งมีคน
  available_seats INTEGER NOT NULL,    -- จำนวนที่นั่งว่าง (total - occupied)
  standing_people INTEGER DEFAULT 0,  -- จำนวนคนยืน/เดิน
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(location_id, zone_name)
);
```

### ตัวอย่างข้อมูล:

| id | location_id | zone_name | total_seats | occupied_seats | available_seats | standing_people | updated_at |
|----|-------------|-----------|-------------|----------------|-----------------|-----------------|------------|
| ... | 1 | Zone A - Silent Study | 80 | 45 | 35 | 3 | 2025-04-20 14:30:00 |
| ... | 1 | Zone B - Group Study | 60 | 38 | 22 | 5 | 2025-04-20 14:30:15 |

---

## 🎯 การทำงานของ Python Script

### 1. Detection Flow

```python
# 1. อ่านวิดีโอแต่ละเฟรม
frame = cap.read()

# 2. ตรวจจับเก้าอี้
detect_results = detect_model(frame)
chairs = [...]  # รายการตำแหน่งเก้าอี้

# 3. ตรวจจับคนและท่าทาง
pose_results = pose_model.track(frame)

# 4. วิเคราะห์ท่าทาง (sitting/standing)
for person in people:
    angle = calculate_angle(hip, knee, ankle)
    if angle < 100:
        posture = "SITTING"
    else:
        posture = "STANDING"

# 5. เช็คว่านั่งบนเก้าอี้หรือไม่
if person.hip in chair.position:
    sitting_count += 1
else:
    standing_count += 1

# 6. ส่งข้อมูลทุก 30 วินาที
if time.time() - last_time > 30:
    update_data(zone_name, sitting_count, standing_count, total_seats)
```

### 2. Upsert Logic

```python
def update_data(zone_name, sit, stand, total_seats):
    available = total_seats - sit
    
    # ใช้ upsert เพื่อ insert หรือ update
    supabase.table("seat_status").upsert({
        "location_id": "1",
        "zone_name": zone_name,
        "total_seats": total_seats,
        "occupied_seats": sit,
        "available_seats": available,
        "standing_people": stand
    }, on_conflict="location_id,zone_name").execute()
    
    # on_conflict บอก Supabase ว่าถ้ามี (location_id, zone_name) ซ้ำ ให้ UPDATE แทน INSERT
```

---

## 📊 Real-time Updates

### React Component Subscription

```typescript
// LibraryZones.tsx
useEffect(() => {
  // Subscribe to real-time updates
  const channel = supabase
    .channel('seat_status_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'seat_status',
      filter: `location_id=eq.${locationId}`
    }, () => {
      fetchZones(); // Re-fetch ข้อมูลใหม่
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [locationId]);
```

### การทำงาน:

1. Python script อัพเดท database ทุก 30 วินาที
2. Supabase Realtime ส่ง event ไปยัง React app
3. React app รับ event และ fetch ข้อมูลใหม่
4. UI อัพเดทอัตโนมัติ

---

## 🐛 Troubleshooting

### ❌ Python Error: "column 'location' does not exist"

**สาเหตุ:** ใช้ script เก่าที่ยังไม่แก้ไข

**แก้ไข:** ใช้ `/python_script_fixed.py` แทน

---

### ❌ Admin แก้ไขแล้ว database ไม่อัพเดท

**สาเหตุ:** RLS policies ยังไม่ปิด

**แก้ไข:** รัน migration `002_fix_rls_policies.sql`

---

### ❌ React app ไม่แสดงข้อมูล real-time

**สาเหตุ:** Realtime subscription ไม่ทำงาน

**แก้ไข:**
1. ไปที่ Supabase Dashboard > Settings > API
2. เปิด "Realtime" (ควรเปิดอยู่แล้ว)
3. Restart app

---

### ❌ Python script ส่งข้อมูลไม่สำเร็จ

**ตรวจสอบ:**

```python
# ดู error message ใน console
❌ [Zone A - Silent Study] Supabase error: {...}
```

**แก้ไขทั่วไป:**
1. ตรวจสอบ Supabase URL และ Key ถูกต้อง
2. ตรวจสอบ internet connection
3. ตรวจสอบว่ารัน migration 003 แล้ว

---

## 🎓 Zone Configuration

### หอสมุดป๋วย อึ้งภากรณ์ ชั้น 2 (location_id = "1")

| Zone | ชื่อเต็ม | ที่นั่งทั้งหมด | Video File | Window Name |
|------|---------|---------------|------------|-------------|
| A | Zone A - Silent Study | 80 | vid1.mp4 | Smart Seating - Zone A |
| B | Zone B - Group Study | 60 | vid2.mp4 | Smart Seating - Zone B |

### ถ้าต้องการเพิ่ม Location ใหม่:

1. เพิ่มข้อมูลใน table `locations`
2. เพิ่มข้อมูลโซนใน table `seat_status`
3. แก้ไข Python script ให้ส่งข้อมูลไปยัง `location_id` ใหม่

---

## ✅ Checklist การติดตั้ง

### Backend
- [ ] รัน migration 001 (users, locations, user_favorites)
- [ ] รัน migration 002 (fix RLS)
- [ ] รัน migration 003 (seat_status)
- [ ] ตรวจสอบ seat_status มี 2 แถว

### Python AI
- [ ] ติดตั้ง dependencies (ultralytics, opencv-python, supabase-py)
- [ ] ดาวน์โหลด YOLO models
- [ ] เตรียม video files
- [ ] แก้ไข paths ใน script
- [ ] ทดสอบรัน script

### React App
- [ ] Login เป็น user ได้
- [ ] เห็นหน้า Location Detail
- [ ] เห็นส่วน LibraryZones (2 โซน)
- [ ] Login เป็น admin ได้
- [ ] แก้ไขข้อมูลได้
- [ ] รีเฟรชแล้วค่ายังคงอยู่

### Integration
- [ ] Python ส่งข้อมูลทุก 30 วินาที
- [ ] Database อัพเดท
- [ ] React app รับ real-time update
- [ ] ไม่มี error ใน console

---

## 📚 เอกสารเพิ่มเติม

1. **COMPLETE_FIX_GUIDE.md** - คู่มือแก้ไขปัญหาทีละขั้นตอน ⭐
2. **PYTHON_INTEGRATION_FIX.md** - วิธีแก้ Python script โดยละเอียด
3. **FIX_DATABASE_UPDATE.md** - วิธีแก้ RLS policies
4. **LIBRARY_ZONES_GUIDE.md** - คู่มือใช้งาน LibraryZones component

---

## 💡 Tips

- 🎥 **Video Quality:** ใช้วิดีโอความละเอียดสูงจะได้ผลลัพธ์แม่นยำกว่า
- ⏱️ **Update Frequency:** ปรับเวลาส่งข้อมูล (default 30 วินาที) ได้ที่บรรทัด 177
- 🪑 **Chair Detection:** ถ้า detect เก้าอี้ไม่ถูกต้อง อาจต้อง train model ใหม่
- 📊 **Real-time:** ถ้าต้องการ update เร็วกว่า ลดเวลาจาก 30 เป็น 10 วินาที

---

## 🎉 สรุป

ระบบนี้รวม 3 ส่วนหลัก:

1. **AI Detection (Python + YOLO)** - ตรวจจับคนและเก้าอี้จากวิดีโอ
2. **Database (Supabase)** - เก็บและซิงค์ข้อมูลแบบเรียลไทม์
3. **Web App (React)** - แสดงผลและให้ admin แก้ไขได้

ทั้ง 3 ส่วนต้องทำงานร่วมกันเพื่อให้ระบบสมบูรณ์!

---

**🚀 พร้อมใช้งานแล้ว! มีปัญหาหรือคำถามเพิ่มเติมถามได้เลยครับ**
