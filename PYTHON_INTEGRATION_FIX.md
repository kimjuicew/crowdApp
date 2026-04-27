# 🔧 แก้ไข Python Script ให้ส่งข้อมูลตรงกับ Database

## 🎯 ปัญหา

Python script (YOLO pose detection) ส่งข้อมูลมาแต่ **schema ไม่ตรงกับ database**

### Python script ใช้:
```python
supabase.table("seat_status").upsert({
    "location": "zone1",           # ❌ ไม่ตรงกับ database
    "sitting_count": sit,          # ❌ ไม่ตรงกับ database
    "standing_count": stand,       # ❌ ไม่ตรงกับ database
    "available_chairs": available  # ❌ ไม่ตรงกับ database
})
```

### Database schema จริง:
```sql
CREATE TABLE seat_status (
  id UUID PRIMARY KEY,
  location_id TEXT,              # ✅ ใช้ location_id + zone_name
  zone_name TEXT,                # ✅ ใช้ zone_name
  total_seats INTEGER,
  occupied_seats INTEGER,        # ✅ ใช้ occupied_seats (ไม่ใช่ sitting_count)
  available_seats INTEGER,       # ✅ ใช้ available_seats (ไม่ใช่ available_chairs)
  standing_people INTEGER,       # ✅ ใช้ standing_people (ไม่ใช่ standing_count)
  updated_at TIMESTAMP,
  UNIQUE(location_id, zone_name)
);
```

---

## ✅ วิธีแก้ไข

### Option 1: แก้ไข Python Script (แนะนำ)

แก้ไขฟังก์ชัน `update_data()` ในไฟล์ Python:

**ก่อนแก้:**
```python
def update_data(location, sit, stand, available):
    try:
        supabase.table("seat_status").upsert({
            "location": location,
            "sitting_count": sit,
            "standing_count": stand,
            "available_chairs": available
        }).execute()
```

**หลังแก้:**
```python
def update_data(zone_name, sit, stand, total_seats=80):
    """
    Update seat status for Puey Library Floor 2
    
    Parameters:
    - zone_name: "Zone A - Silent Study" หรือ "Zone B - Group Study"
    - sit: จำนวนคนนั่ง (occupied_seats)
    - stand: จำนวนคนยืน (standing_people)
    - total_seats: จำนวนที่นั่งทั้งหมด (default 80)
    """
    try:
        available = total_seats - sit  # คำนวณที่ว่าง
        
        supabase.table("seat_status").upsert({
            "location_id": "1",              # ✅ หอสมุดป๋วย = location_id "1"
            "zone_name": zone_name,          # ✅ ชื่อโซน
            "total_seats": total_seats,      # ✅ ที่นั่งทั้งหมด
            "occupied_seats": sit,           # ✅ ที่นั่งมีคน
            "available_seats": available,    # ✅ ที่นั่งว่าง
            "standing_people": stand         # ✅ คนยืน/เดิน
        }, on_conflict="location_id,zone_name").execute()  # ✅ ระบุ conflict target
        
        print(f"✅ [{zone_name}] Sent: occupied={sit}, available={available}, standing={stand}")
    except Exception as e:
        print(f"❌ [{zone_name}] Supabase error: {e}")
```

**แก้ไขการเรียกใช้ใน main:**
```python
# เปลี่ยนจาก
t1 = threading.Thread(target=run_video, args=(
    r"C:\Users\user\Desktop\introvertapp\vid1.mp4",
    "zone1",  # ❌ เดิม
    pose_model_1,
    detect_model_1,
    "Smart Seating - Zone 1"
))

# เป็น
t1 = threading.Thread(target=run_video, args=(
    r"C:\Users\user\Desktop\introvertapp\vid1.mp4",
    "Zone A - Silent Study",  # ✅ ตรงกับ database
    pose_model_1,
    detect_model_1,
    "Smart Seating - Zone A"
))

t2 = threading.Thread(target=run_video, args=(
    r"C:\Users\user\Desktop\introvertapp\vid2.mp4",
    "Zone B - Group Study",  # ✅ ตรงกับ database
    pose_model_2,
    detect_model_2,
    "Smart Seating - Zone B"
))
```

**แก้ไขฟังก์ชัน run_video:**
```python
def run_video(video_path, zone_name, pose_model, detect_model, window_name, total_seats=80):
    # ... (โค้ดเดิม) ...
    
    # ในส่วนที่ส่งข้อมูล (บรรทัด 177)
    if time.time() - last_time > 30:
        update_data(zone_name, sitting_count, standing_count, total_seats)
        last_time = time.time()
```

---

### Option 2: สร้าง Migration ใหม่ (ไม่แนะนำ)

สร้าง view หรือ trigger ที่แปลง column names เก่าเป็นใหม่ แต่วิธีนี้ซับซ้อนกว่า

---

## 📊 ข้อมูลที่ต้องการ

### Zone Names ที่ถูกต้อง:
- Zone A: `"Zone A - Silent Study"`
- Zone B: `"Zone B - Group Study"`

### Location ID:
- หอสมุดป๋วยชั้น 2: `location_id = "1"`

### จำนวนที่นั่ง:
- Zone A: 80 ที่
- Zone B: 60 ที่

จาก migration 003:
```sql
INSERT INTO seat_status (location_id, zone_name, total_seats, occupied_seats, available_seats, standing_people) VALUES
  ('1', 'Zone A - Silent Study', 80, 45, 35, 3),
  ('1', 'Zone B - Group Study', 60, 38, 22, 5);
```

---

## 🧪 ทดสอบ

### 1. ทดสอบ Python script:

```python
# ทดสอบส่งข้อมูล
update_data("Zone A - Silent Study", 50, 5, 80)
```

### 2. ตรวจสอบใน Supabase:

```sql
SELECT * FROM seat_status 
WHERE location_id = '1' 
ORDER BY zone_name;
```

ควรเห็น:
```
| location_id | zone_name              | occupied_seats | available_seats | standing_people |
|-------------|------------------------|----------------|-----------------|-----------------|
| 1           | Zone A - Silent Study  | 50             | 30              | 5               |
| 1           | Zone B - Group Study   | ...            | ...             | ...             |
```

### 3. ดูใน React app:

1. ไปที่หน้ารายละเอียด "หอสมุดป๋วย อึ้งภากรณ์"
2. เลื่อนลงไปที่ "ข้อมูลที่นั่งแบบเรียลไทม์"
3. ควรเห็นข้อมูลอัพเดทตาม Python script

---

## 🔄 Real-time Updates

หลังแก้ไข Python script:

1. ✅ Python script ส่งข้อมูลทุก 30 วินาที
2. ✅ Database อัพเดทอัตโนมัติ (upsert)
3. ✅ React app รับ real-time update ผ่าน Supabase Realtime
4. ✅ User เห็นข้อมูลที่นั่งอัพเดทแบบเรียลไทม์

---

## 📋 Checklist

- [ ] แก้ไข function `update_data()` ให้ใช้ schema ใหม่
- [ ] เปลี่ยน zone names เป็น "Zone A - Silent Study" และ "Zone B - Group Study"
- [ ] เพิ่ม parameter `total_seats` 
- [ ] เพิ่ม `on_conflict` ใน upsert
- [ ] ทดสอบส่งข้อมูลจาก Python
- [ ] ตรวจสอบ database อัพเดท
- [ ] ตรวจสอบ React app แสดงข้อมูลใหม่

---

## 🐛 Troubleshooting

### ❌ Error: "duplicate key value violates unique constraint"

**สาเหตุ:** ไม่ระบุ `on_conflict`

**แก้ไข:** เพิ่ม `.upsert({...}, on_conflict="location_id,zone_name")`

---

### ❌ Error: "column 'location' does not exist"

**สาเหตุ:** ยังใช้ schema เก่า

**แก้ไข:** ใช้ `location_id` และ `zone_name` แทน `location`

---

### ❌ ข้อมูลไม่อัพเดทใน React app

**สาเหตุ:** Real-time subscription ไม่ทำงาน

**ตรวจสอบ:**
1. เปิด Console (F12)
2. ควรเห็น `🔔 [LibraryZones] Real-time update received`
3. ถ้าไม่เห็น → ตรวจสอบ Supabase Realtime enabled

---

## 🎉 ผลลัพธ์

หลังแก้ไข Python script:

- ✅ YOLO ตรวจจับคนนั่ง/ยืนได้ถูกต้อง
- ✅ ส่งข้อมูลไป Supabase สำเร็จ
- ✅ Database อัพเดททุก 30 วินาที
- ✅ Admin เห็นข้อมูลเรียลไทม์
- ✅ User เห็นข้อมูลที่นั่งอัพเดทอัตโนมัติ

---

**💡 Tip:** ถ้ามีหลาย location ที่ใช้ seat tracking ให้ส่ง `location_id` เป็น parameter ได้เลย!
