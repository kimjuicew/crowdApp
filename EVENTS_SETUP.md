# Events & Prediction Features Setup

## คุณสมบัติใหม่

### 1. หน้ากิจกรรม (Events Page)
- แสดงกิจกรรมและอีเวนต์ที่กำลังจะมาถึงของแต่ละสถานที่
- กรองกิจกรรมตามสถานที่
- แสดงวันที่ เวลา และจำนวนผู้เข้าร่วมที่คาดการณ์
- เข้าถึงได้จากปุ่มปฏิทิน (Calendar) ใน User Dashboard

### 2. ระบบทำนายจำนวนคน (Prediction System)
- ทำนายจำนวนคนใน 7 วันข้างหน้า
- วิเคราะห์ข้อมูลจากรูปแบบการใช้งานในอดีต (30 วันที่ผ่านมา)
- แสดงกราฟและความเชื่อมั่นของการทำนาย
- เข้าถึงได้จากปุ่ม "ทำนายจำนวนคน" ในหน้า Location Detail

## การติดตั้ง

### 1. รัน Database Migration

คุณต้องรัน migration ใหม่เพื่อสร้างตาราง events:

\`\`\`bash
# ใน Supabase Dashboard SQL Editor
# รันไฟล์: supabase/migrations/004_add_events_table.sql
\`\`\`

หรือถ้าใช้ Supabase CLI:

\`\`\`bash
supabase db push
\`\`\`

### 2. ตรวจสอบว่า Migration สำเร็จ

ตรวจสอบใน Supabase Dashboard:
- Table Editor > events table ควรมีข้อมูลตัวอย่าง 6 รายการ
- Authentication > RLS Policies > events ควรมี 4 policies

## โครงสร้างตาราง Events

\`\`\`sql
events (
  id UUID PRIMARY KEY,
  location_id TEXT,
  title TEXT,
  description TEXT,
  event_date DATE,
  start_time TIME,
  end_time TIME,
  estimated_attendance INTEGER,
  category TEXT,
  created_at TIMESTAMPTZ
)
\`\`\`

## การใช้งาน

### สำหรับผู้ใช้ทั่วไป (User)

1. **ดูกิจกรรม**
   - คลิกปุ่มปฏิทิน (Calendar) ใน Dashboard
   - เลือกกรองตามสถานที่ที่สนใจ
   - คลิกที่กิจกรรมเพื่อไปยังหน้ารายละเอียดสถานที่

2. **ดูการทำนาย**
   - เข้าหน้ารายละเอียดสถานที่
   - คลิกปุ่ม "ดูการทำนาย 7 วัน"
   - ดูกราฟและรายละเอียดการทำนายแต่ละวัน

### สำหรับ Admin

Admin สามารถเพิ่ม/แก้ไข/ลบกิจกรรมได้ผ่าน Supabase Dashboard:
- Table Editor > events
- ใส่ข้อมูลกิจกรรมใหม่
- ระบุ location_id, วันที่, เวลา และจำนวนผู้เข้าร่วมที่คาดการณ์

## คุณสมบัติเพิ่มเติม

### การทำนายแบบ AI (สำหรับหอสมุดป๋วยชั้น 2)
- ใช้ข้อมูลจริงจาก seat_status table
- วิเคราะห์รูปแบบตามวันในสัปดาห์
- คำนวณ confidence level จาก standard deviation
- สำหรับสถานที่อื่นๆ ใช้ pattern-based prediction

### Realtime Updates
- กิจกรรมอัพเดทแบบเรียลไทม์
- การทำนายใช้ข้อมูลล่าสุด
- รองรับ Supabase Realtime subscriptions

## Routes ใหม่

- `/events` - หน้าแสดงกิจกรรมทั้งหมด

## Components ใหม่

1. `Events.tsx` - หน้ากิจกรรม
2. `PredictionModal.tsx` - Modal แสดงการทำนาย
3. อัพเดท `LocationDetail.tsx` - เพิ่มปุ่มทำนาย
4. อัพเดท `UserDashboard.tsx` - เพิ่มปุ่มกิจกรรม

## ข้อมูลตัวอย่าง

Migration จะสร้างกิจกรรมตัวอย่าง 6 รายการ:
1. Workshop: เทคนิคการอ่านอย่างมีประสิทธิภาพ (หอสมุดป๋วย)
2. เทศกาลอาหาร: มหกรรมอาหารนานาชาติ (โรงอาหาร JC)
3. ฟรีคลาส: Zumba Dance (ฟิตเนส)
4. การบรรยาย: การวิจัยในยุคดิจิทัล (หอสมุดป๋วย)
5. แข่งขัน: Coding Competition (ห้องคอม)
6. การแข่งขันว่ายน้ำ (สระว่ายน้ำ)
