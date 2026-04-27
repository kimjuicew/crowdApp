# ✅ CrowdWatch Setup Checklist

ทำเครื่องหมายถูก (✓) เมื่อเสร็จแต่ละขั้นตอน

## 📋 Database Setup

- [ ] เปิด Supabase SQL Editor
- [ ] คัดลอกไฟล์ `supabase/migrations/001_initial_schema_clean.sql`
- [ ] วางลงใน SQL Editor
- [ ] กด RUN
- [ ] ตรวจสอบว่ามีตาราง `users` (3 rows)
- [ ] ตรวจสอบว่ามีตาราง `locations` (6 rows)
- [ ] ตรวจสอบว่ามีตาราง `user_favorites` (0 rows)

## 🧪 Testing

- [ ] Login ด้วย user/user123 สำเร็จ
- [ ] เห็นสถานที่ทั้ง 6 แห่งใน Dashboard
- [ ] คลิกดูรายละเอียดสถานที่ได้
- [ ] กดปุ่มกรองหมวดหมู่ทำงาน
- [ ] เห็นกราฟความหนาแน่นตลอดวัน
- [ ] กดปุ่ม ⭐ Favorite แล้วมี toast notification
- [ ] กดปุ่ม 🔔 Notification แล้วมี toast notification
- [ ] ไปหน้า Profile เห็นสถานที่โปรด
- [ ] คลิกที่สถานที่โปรดแล้วเข้าดูรายละเอียดได้
- [ ] กด "แก้ไขข้อมูลส่วนตัว" ทำงาน
- [ ] แก้ไขชื่อ/อีเมล/เบอร์โทร แล้วบันทึกได้
- [ ] กลับหน้า Profile เห็นข้อมูลที่แก้ไข
- [ ] Logout แล้ว Login ใหม่ได้
- [ ] ลอง Sign Up account ใหม่สำเร็จ

## 📊 Admin Testing (Optional)

- [ ] Login ด้วย admin/admin123
- [ ] เห็นหน้า Admin Dashboard
- [ ] เลือกสถานที่ที่รับผิดชอบ
- [ ] อัปเดตจำนวนคนได้
- [ ] อัปเดตความจุได้
- [ ] เห็นสถานะเปลี่ยนตามจำนวนคน (low/medium/high)

## 🔧 Git & Deployment

- [ ] รัน `bash commit-changes.sh` (หรือ commit manually)
- [ ] สร้าง repository บน GitHub/GitLab
- [ ] เพิ่ม remote: `git remote add origin URL`
- [ ] เปลี่ยน branch: `git branch -M main`
- [ ] Push: `git push -u origin main`
- [ ] ตรวจสอบว่าโค้ดขึ้น GitHub/GitLab

## 🎨 UI/UX Verification

- [ ] สีตรงตาม design (brown #6B4F3A, cream #FAF9F5)
- [ ] Animation smooth (ไม่กระตุก)
- [ ] Responsive บนหน้าจอต่างๆ
- [ ] Loading state แสดงถูกต้อง
- [ ] Error state แสดงถูกต้อง
- [ ] Toast notification แสดงถูกต้อง
- [ ] ไม่มี warning ใน Console (F12)

## 📱 Mobile Testing (Optional)

- [ ] Dashboard แสดงผลดีบนมือถือ
- [ ] Location Detail แสดงผลดีบนมือถือ
- [ ] กราฟแสดงผลดีบนมือถือ
- [ ] ปุ่มต่างๆ กดได้ง่ายบนมือถือ

## 🔒 Security Check

- [ ] RLS policies ทำงาน (ดูได้เฉพาะข้อมูลตัวเอง)
- [ ] Admin policies ทำงาน (แก้ไขได้เฉพาะ admin)
- [ ] Login ป้องกัน SQL injection (Supabase จัดการให้)
- [ ] Password ไม่แสดงใน Console/Network tab

## 📚 Documentation

- [ ] README.md มีข้อมูลครบถ้วน
- [ ] QUICK_START.md อ่านง่าย
- [ ] START_HERE.md มีขั้นตอนชัดเจน
- [ ] SUPABASE_SETUP.md มีคำแนะนำ
- [ ] GIT_SETUP.md มีวิธี push

## 🎉 Final Check

- [ ] แอพทำงานได้ 100%
- [ ] Database เชื่อมต่อสำเร็จ
- [ ] ทุกปุ่มทำงาน
- [ ] ทุก feature ทำงาน
- [ ] โค้ดอยู่บน Git แล้ว
- [ ] พร้อมใช้งานจริง

---

## ✅ เมื่อทำครบทุกข้อ:

**🎊 ยินดีด้วย! CrowdWatch พร้อมใช้งาน 100%!**

Share repo กับทีม:
```
https://github.com/YOUR_USERNAME/crowdwatch
```

Deploy to production:
- Vercel: https://vercel.com
- Netlify: https://netlify.com
- Cloudflare Pages: https://pages.cloudflare.com
