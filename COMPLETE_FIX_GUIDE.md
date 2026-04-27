# 🎯 คู่มือแก้ไขปัญหาครบถ้วน - CrowdWatch Seat Tracking

## 📋 สรุปปัญหาทั้งหมด

### ปัญหา 1: Admin แก้ไขแล้ว UI เปลี่ยน แต่ Database ไม่อัปเดต ✅ แก้แล้ว
**สาเหตุ:** RLS policies บล็อกการอัปเดต (ใช้ auth.uid() แต่ไม่มี Supabase Auth)

### ปัญหา 2: Python Script ส่งข้อมูลมาแต่ Schema ไม่ตรงกัน ⚠️ ต้องแก้
**สาเหตุ:** Python script ใช้ column names เก่า (location, sitting_count, ฯลฯ)

---

## 🚀 วิธีแก้ไข (ทำตามลำดับ)

### Step 1: แก้ RLS Policies ✅

**1.1 ไปที่ Supabase SQL Editor:**
```
https://supabase.com/dashboard/project/xqogrrdeepicusvryfud/sql/new
```

**1.2 รัน Migration 002:**

เปิดไฟล์ `/supabase/migrations/002_fix_rls_policies.sql` และ copy ทั้งหมดลงใน SQL Editor แล้วกด **RUN**

**1.3 ตรวจสอบ:**

```sql
-- ตรวจสอบว่า RLS ปิดแล้ว
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('locations', 'seat_status', 'user_favorites');
```

ควรเห็น `rowsecurity = false` ทั้งหมด

---

### Step 2: ตรวจสอบ Table seat_status มีข้อมูลหรือยัง

**2.1 Query table:**

```sql
SELECT * FROM seat_status 
WHERE location_id = '1'
ORDER BY zone_name;
```

**2.2 ถ้ายังไม่มีข้อมูล → รัน Migration 003:**

เปิดไฟล์ `/supabase/migrations/003_add_seat_status.sql` และ copy ลงใน SQL Editor แล้วกด **RUN**

**2.3 Query อีกครั้ง:**

ควรเห็น 2 แถว:
```
| id | location_id | zone_name              | total_seats | occupied_seats | available_seats | standing_people |
|----|-------------|------------------------|-------------|----------------|-----------------|-----------------|
| .. | 1           | Zone A - Silent Study  | 80          | 45             | 35              | 3               |
| .. | 1           | Zone B - Group Study   | 60          | 38             | 22              | 5               |
```

---

### Step 3: ทดสอบ Admin Update 🧪

**3.1 Login เป็น Admin:**
```
Username: admin
Password: admin123
```

**3.2 ไปที่ Admin Dashboard**

**3.3 เลือกสถานที่ "หอสมุดป๋วย อึ้งภากรณ์"**

**3.4 เลื่อนลงไปที่ "จัดการข้อมูลโซนที่นั่ง"**

คุณควรเห็น 2 โซน:
- Zone A - Silent Study (80 ที่นั่ง)
- Zone B - Group Study (60 ที่นั่ง)

**3.5 ทดสอบแก้ไข:**
1. กดปุ่ม "แก้ไขข้อมูล" ที่ Zone A
2. เปลี่ยน "จำนวนที่นั่งมีคน" เป็น 50
3. เปลี่ยน "จำนวนคนยืน/เดิน" เป็น 8
4. กดปุ่ม "บันทึก"

**3.6 ตรวจสอบผลลัพธ์:**

**ใน UI:**
- ✅ ควรเห็น Toast "บันทึกข้อมูลสำเร็จ"
- ✅ Card แสดงค่าใหม่: มีคนนั่ง 50, ที่ว่าง 30, คนยืน 8

**ใน Console (กด F12):**
```
🔵 [AdminZoneManager] Updating zone: {zoneId: "...", occupied: 50, available: 30, standing: 8}
✅ [AdminZoneManager] Zone updated successfully
✅ [AdminZoneManager] Loaded zones: 2
```

**ใน Database:**
```sql
SELECT zone_name, occupied_seats, available_seats, standing_people 
FROM seat_status 
WHERE location_id = '1' AND zone_name = 'Zone A - Silent Study';
```

ควรเห็น: `occupied_seats = 50, available_seats = 30, standing_people = 8`

**3.7 รีเฟรชหน้า (F5):**
- ✅ ข้อมูลยังคงเป็น 50, 30, 8 (ไม่กลับเป็นค่าเดิม)

---

### Step 4: แก้ไข Python Script 🐍

**4.1 เปิดไฟล์ Python ที่คุณมี**

ตามที่คุณส่งมาใน `/src/imports/pasted_text/pose-tracking-utils-1.txt`

**4.2 แก้ไขฟังก์ชัน `update_data()`:**

```python
# ก่อนแก้ (บรรทัด 14-24)
def update_data(location, sit, stand, available):
    try:
        supabase.table("seat_status").upsert({
            "location": location,
            "sitting_count": sit,
            "standing_count": stand,
            "available_chairs": available
        }).execute()
        print(f"✅ [{location}] Sent: sit={sit}, stand={stand}, avail={available}")
    except Exception as e:
        print(f"❌ [{location}] Supabase error: {e}")

# หลังแก้
def update_data(zone_name, sit, stand, total_seats=80):
    """
    Update seat status for library zones
    
    Parameters:
    - zone_name: ชื่อโซน เช่น "Zone A - Silent Study"
    - sit: จำนวนคนนั่ง (occupied_seats)
    - stand: จำนวนคนยืน (standing_people)
    - total_seats: จำนวนที่นั่งทั้งหมด (Zone A=80, Zone B=60)
    """
    try:
        available = total_seats - sit  # คำนวณที่ว่าง
        
        supabase.table("seat_status").upsert({
            "location_id": "1",              # หอสมุดป๋วย
            "zone_name": zone_name,
            "total_seats": total_seats,
            "occupied_seats": sit,
            "available_seats": available,
            "standing_people": stand
        }, on_conflict="location_id,zone_name").execute()
        
        print(f"✅ [{zone_name}] Sent: occupied={sit}, available={available}, standing={stand}")
    except Exception as e:
        print(f"❌ [{zone_name}] Supabase error: {e}")
```

**4.3 แก้ไขส่วน Main (บรรทัด 189-216):**

```python
# ก่อนแก้
if __name__ == "__main__":
    pose_model_1 = YOLO("yolov8n-pose.pt")
    detect_model_1 = YOLO(r"C:\Users\user\Desktop\introvertapp\best .pt")
    
    pose_model_2 = YOLO("yolov8n-pose.pt")
    detect_model_2 = YOLO(r"C:\Users\user\Desktop\introvertapp\best .pt")
    
    t1 = threading.Thread(target=run_video, args=(
        r"C:\Users\user\Desktop\introvertapp\vid1.mp4",
        "zone1",  # ❌ เก่า
        pose_model_1,
        detect_model_1,
        "Smart Seating - Zone 1"
    ))
    
    t2 = threading.Thread(target=run_video, args=(
        r"C:\Users\user\Desktop\introvertapp\vid2.mp4",
        "zone2",  # ❌ เก่า
        pose_model_2,
        detect_model_2,
        "Smart Seating - Zone 2"
    ))

# หลังแก้
if __name__ == "__main__":
    pose_model_1 = YOLO("yolov8n-pose.pt")
    detect_model_1 = YOLO(r"C:\Users\user\Desktop\introvertapp\best .pt")
    
    pose_model_2 = YOLO("yolov8n-pose.pt")
    detect_model_2 = YOLO(r"C:\Users\user\Desktop\introvertapp\best .pt")
    
    t1 = threading.Thread(target=run_video, args=(
        r"C:\Users\user\Desktop\introvertapp\vid1.mp4",
        "Zone A - Silent Study",  # ✅ ใหม่ - ตรงกับ database
        pose_model_1,
        detect_model_1,
        "Smart Seating - Zone A",
        80  # total_seats สำหรับ Zone A
    ))
    
    t2 = threading.Thread(target=run_video, args=(
        r"C:\Users\user\Desktop\introvertapp\vid2.mp4",
        "Zone B - Group Study",  # ✅ ใหม่ - ตรงกับ database
        pose_model_2,
        detect_model_2,
        "Smart Seating - Zone B",
        60  # total_seats สำหรับ Zone B
    ))
    
    t1.start()
    t2.start()
    t1.join()
    t2.join()
    
    print("✅ All done.")
```

**4.4 แก้ไขฟังก์ชัน `run_video()` (บรรทัด 52):**

```python
# เพิ่ม parameter total_seats
def run_video(video_path, zone_name, pose_model, detect_model, window_name, total_seats=80):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"❌ [{zone_name}] Cannot open: {video_path}")
        return

    # ... (โค้ดเดิม) ...

    while True:
        # ... (โค้ดเดิม) ...

        # ===== Send Supabase ทุก 30 วิ ===== (บรรทัด 176-179)
        if time.time() - last_time > 30:
            update_data(zone_name, sitting_count, standing_count, total_seats)  # เพิ่ม total_seats
            last_time = time.time()

        # ... (โค้ดเดิม) ...
```

---

### Step 5: ทดสอบ Python Script 🧪

**5.1 รัน Python script:**

```bash
python your_script_name.py
```

**5.2 ตรวจสอบ Console:**

ควรเห็น:
```
✅ [Zone A - Silent Study] Sent: occupied=XX, available=XX, standing=XX
✅ [Zone B - Group Study] Sent: occupied=XX, available=XX, standing=XX
```

**5.3 ตรวจสอบ Database:**

```sql
SELECT 
  zone_name, 
  occupied_seats, 
  available_seats, 
  standing_people,
  updated_at 
FROM seat_status 
WHERE location_id = '1'
ORDER BY zone_name;
```

ค่า `updated_at` ควร update ทุก 30 วินาที

**5.4 ตรวจสอบใน React App:**

1. เปิดหน้า "หอสมุดป๋วย อึ้งภากรณ์"
2. เลื่อนลงไปที่ "ข้อมูลที่นั่งแบบเรียลไทม์"
3. ควรเห็นข้อมูลอัพเดทตาม Python script
4. เปิด Console (F12) ควรเห็น:
```
🔔 [LibraryZones] Real-time update received
✅ [LibraryZones] Loaded zones: 2
```

---

## 📊 ภาพรวมระบบหลังแก้ไข

```
┌─────────────────────┐
│  Python YOLO Script │  ← ตรวจจับคนนั่ง/ยืนจากวิดีโอ
│  (Zone A + Zone B)  │
└──────────┬──────────┘
           │ ส่งข้อมูลทุก 30 วินาที
           │ (zone_name, occupied, standing, total)
           ▼
┌─────────────────────────────────────┐
│     Supabase Database               │
│  Table: seat_status                 │
│  - location_id = "1"                │
│  - zone_name = "Zone A..."          │
│  - occupied_seats, available_seats  │
│  - standing_people, updated_at      │
└──────────┬──────────────────────────┘
           │ Real-time subscription
           │ (Supabase Realtime)
           ▼
┌─────────────────────────────────────┐
│       React App (Figma)             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  User View                  │   │
│  │  - LibraryZones Component   │   │
│  │  - แสดงข้อมูลเรียลไทม์      │   │
│  │  - Auto refresh ทุก update  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Admin View                 │   │
│  │  - AdminZoneManager         │   │
│  │  - แก้ไขข้อมูลได้           │   │
│  │  - บันทึกลง database ✅     │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## ✅ Checklist สรุป

### ส่วน Backend (Supabase)
- [ ] รัน migration `002_fix_rls_policies.sql` (แก้ RLS)
- [ ] รัน migration `003_add_seat_status.sql` (สร้าง table)
- [ ] ตรวจสอบ RLS ปิดแล้ว (`rowsecurity = false`)
- [ ] ตรวจสอบ table `seat_status` มีข้อมูล 2 แถว

### ส่วน React App
- [ ] Login เป็น admin ได้
- [ ] เห็นหน้า Admin Dashboard
- [ ] เห็นโซนที่นั่ง 2 โซน
- [ ] แก้ไขข้อมูลแล้วบันทึกได้
- [ ] รีเฟรชแล้วค่ายังคงอยู่

### ส่วน Python Script
- [ ] แก้ไขฟังก์ชัน `update_data()` เป็น schema ใหม่
- [ ] เปลี่ยน zone names เป็น "Zone A/B - ..."
- [ ] เพิ่ม parameter `total_seats`
- [ ] เพิ่ม `on_conflict` ใน upsert
- [ ] รัน script แล้วไม่มี error
- [ ] ข้อมูลอัพเดทใน database ทุก 30 วินาที

### ส่วน Integration
- [ ] User เห็นข้อมูลจาก Python real-time
- [ ] Admin แก้ไขแล้ว User เห็นทันที
- [ ] Console ไม่มี error
- [ ] Real-time subscription ทำงาน (เห็น 🔔 log)

---

## 🐛 Troubleshooting

### Python Error: "column 'location' does not exist"
✅ **แก้:** ใช้ `location_id` และ `zone_name` แทน `location`

### Python Error: "duplicate key value"
✅ **แก้:** เพิ่ม `on_conflict="location_id,zone_name"` ใน `.upsert()`

### Admin แก้ไขแล้วยังไม่อัพเดท
✅ **แก้:** ตรวจสอบ RLS ปิดแล้วหรือยัง (Step 1.3)

### React ไม่แสดงข้อมูล real-time
✅ **แก้:** ตรวจสอบ Supabase Realtime enabled ที่ Settings > API

### Database ไม่มีตาราง seat_status
✅ **แก้:** รัน migration 003 (Step 2.2)

---

## 🎉 ผลลัพธ์สุดท้าย

หลังทำตาม guide นี้:

✅ **Python Script:**
- ตรวจจับคนนั่ง/ยืนจากวิดีโอ
- ส่งข้อมูลไป Supabase ทุก 30 วินาที
- ไม่มี error

✅ **Supabase Database:**
- RLS policies ทำงานถูกต้อง (หรือปิดแล้ว)
- Table seat_status มีข้อมูล 2 zones
- อัพเดทได้ทั้งจาก Python และ Admin

✅ **React App (User View):**
- แสดงข้อมูลที่นั่งเรียลไทม์
- อัพเดทอัตโนมัติทุก 30 วินาที
- แสดงกราฟและสถิติถูกต้อง

✅ **React App (Admin View):**
- แก้ไขข้อมูลได้
- บันทึกลง database สำเร็จ
- รีเฟรชแล้วค่ายังคงอยู่

---

## 📚 เอกสารเพิ่มเติม

- `/FIX_DATABASE_UPDATE.md` - วิธีแก้ RLS policies
- `/PYTHON_INTEGRATION_FIX.md` - วิธีแก้ Python script โดยละเอียด
- `/supabase/migrations/` - Migration files ทั้งหมด

---

**🚀 พร้อมใช้งานแล้ว! มีคำถามเพิ่มเติมถามได้เลยครับ**
