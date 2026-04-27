# 🎯 CrowdWatch - Real-time Crowd Density Monitoring System

ระบบติดตามความหนาแน่นของสถานที่ต่างๆ ภายในมหาวิทยาลัยธรรมศาสตร์ แบบเรียลไทม์

![CrowdWatch](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)

## ✨ Features

### 👥 สำหรับผู้ใช้งาน (User)
- 📊 ดูความหนาแน่นของสถานที่ต่างๆ แบบเรียลไทม์
- 🔍 กรองสถานที่ตามประเภท (ห้องสมุด, ฟิตเนส, โรงอาหาร, ฯลฯ)
- ⭐ เพิ่มสถานที่โปรดเพื่อเข้าถึงได้รวดเร็ว
- 🔔 รับการแจ้งเตือนเมื่อสถานที่เริ่มว่าง
- 📈 ดูกราฟความหนาแน่นตลอดทั้งวัน
- 💡 รับคำแนะนำสถานที่ทางเลือกเมื่อสถานที่เต็ม
- 👤 จัดการข้อมูลส่วนตัวและการตั้งค่า

### 🛠️ สำหรับผู้ดูแลระบบ (Admin)
- 🎯 อัปเดตความหนาแน่นและจำนวนคนในสถานที่
- 📝 จัดการข้อมูลสถานที่ที่รับผิดชอบ
- 🔄 ดูสถิติและแนวโน้มการใช้งาน

## 🏗️ Tech Stack

### Frontend
- **React 18.3.1** - UI Framework
- **TypeScript** - Type Safety
- **React Router 7** - Navigation
- **Tailwind CSS v4** - Styling
- **Motion (Framer Motion)** - Animations
- **Recharts** - Data Visualization
- **Lucide React** - Icons
- **Sonner** - Toast Notifications

### Backend & Database
- **Supabase** - PostgreSQL Database
- **Row Level Security (RLS)** - Data Access Control

### Development Tools
- **Vite** - Build Tool
- **pnpm** - Package Manager

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- Supabase account

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd crowdwatch
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Setup Supabase Database

**⚠️ IMPORTANT: คุณต้องรันคำสั่งนี้ก่อนใช้งานแอพ!**

อ่านคำแนะนำโดยละเอียดใน: **[START_HERE.md](./START_HERE.md)**

**Quick Setup (3 migrations ต้องรันทั้งหมด!):**

1. ไปที่: https://supabase.com/dashboard/project/xqogrrdeepicusvryfud/sql/new
2. รัน migration #1: `supabase/migrations/001_initial_schema_clean.sql` → **RUN**
3. รัน migration #2: `supabase/migrations/002_fix_rls_policies.sql` → **RUN**
4. รัน migration #3: `supabase/migrations/003_add_seat_status.sql` → **RUN**

**แต่ละไฟล์ทำอะไร?**
- `001_initial_schema_clean.sql` - สร้างตาราง users, locations, user_favorites
- `002_fix_rls_policies.sql` - แก้ไข RLS ให้ admin อัปเดต database ได้
- `003_add_seat_status.sql` - เพิ่มตาราง seat_status สำหรับระบบติดตามที่นั่ง (Library Zones)

**อ่านรายละเอียด:**
- [ADMIN_DATABASE_FIX_SUMMARY.md](./ADMIN_DATABASE_FIX_SUMMARY.md) - แก้ปัญหา admin update
- [LIBRARY_ZONES_GUIDE.md](./LIBRARY_ZONES_GUIDE.md) - ระบบติดตามที่นั่งแบบเรียลไทม์

### 4. Start development server

```bash
pnpm dev
```

แอพจะเปิดที่ http://localhost:5173

## 🔐 Demo Accounts

### ผู้ใช้ทั่วไป
- Username: `user`
- Password: `user123`

### ผู้ดูแลระบบ
- Username: `admin`
- Password: `admin123`

## 📁 Project Structure

```
crowdwatch/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── crowd/          # CrowdWatch components
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── UserDashboard.tsx
│   │   │   │   ├── LocationDetail.tsx
│   │   │   │   ├── UserProfile.tsx
│   │   │   │   ├── EditProfile.tsx
│   │   │   │   └── AdminDashboard.tsx
│   │   │   └── ui/             # shadcn/ui components
│   │   ├── context/
│   │   │   └── LocationContext.tsx
│   │   ├── data/
│   │   │   └── mockData.ts
│   │   └── App.tsx
│   ├── lib/
│   │   └── supabase.ts         # Supabase client
│   └── styles/
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/                      # Static assets
└── package.json
```

## 🎨 Design System

### Colors
- **Primary**: `#6B4F3A` (Brown)
- **Background**: `#FAF9F5` (Cream)
- **Border**: `#D3D1C7` (Light Gray)
- **Accent Background**: `#F1EFE8` (Light Cream)

### Density Status Colors
- **ว่าง (Low)**: `#1D9E75` (Green)
- **ปานกลาง (Medium)**: `#EF9F27` (Orange)
- **แน่น (High)**: `#E24B4A` (Red)

## 🗃️ Database Schema

### Tables

**users**
- User accounts and preferences
- Notification settings
- Role-based access (user/admin)

**locations**
- Location data and real-time crowd information
- Hourly density patterns
- Capacity and current count

**user_favorites**
- User favorite locations
- Many-to-many relationship

ดูรายละเอียดเพิ่มเติมใน: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## 🚀 Deployment

### Build for production

```bash
pnpm build
```

### Environment Variables

Create `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 🧪 Testing the App

1. **Login** - ใช้ demo account หรือสมัครสมาชิกใหม่
2. **View Locations** - ดูสถานที่ทั้งหมดในหน้า Dashboard
3. **Filter Categories** - กดปุ่มหมวดหมู่ด้านบนเพื่อกรอง
4. **Location Details** - คลิกที่การ์ดเพื่อดูรายละเอียด
5. **Add to Favorites** - กดปุ่ม ⭐ เพื่อเพิ่มสถานที่โปรด
6. **Enable Notifications** - กดปุ่ม 🔔 เพื่อรับการแจ้งเตือน
7. **View Profile** - ดูสถานที่โปรดและจัดการข้อมูล
8. **Edit Profile** - แก้ไขข้อมูลส่วนตัว

## 📝 Available Scripts

```bash
# Development
pnpm dev          # Start dev server

# Build
pnpm build        # Build for production

# Git
git status        # Check git status
git log           # View commit history
```

## 🔧 Troubleshooting

### Dashboard ว่างเปล่า
- ตรวจสอบว่ารัน Supabase migration แล้ว
- เปิด Browser Console (F12) ดู error
- ตรวจสอบ `locations` table มีข้อมูล

### Login ไม่ได้
- ตรวจสอบ `users` table มีข้อมูล
- ลอง clear browser cache และ localStorage
- ใช้ demo account: user/user123

### ปุ่มไม่ทำงาน
- ตรวจสอบว่า login แล้ว
- เปิด Browser Console ดู error
- Refresh หน้าเว็บ

ดูเพิ่มเติมใน: [RUN_THIS_FIRST.md](./RUN_THIS_FIRST.md)

## 📚 Documentation

- [RUN_THIS_FIRST.md](./RUN_THIS_FIRST.md) - คำแนะนำก่อนใช้งาน
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - คู่มือการตั้งค่า Supabase
- [GIT_SETUP.md](./GIT_SETUP.md) - คำแนะนำการ Push to Git

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is created for educational purposes at Thammasat University.

## 👥 Team

Developed by CrowdWatch Team with assistance from Claude Sonnet 4.5

---

**🎓 Thammasat University** | **📍 Thailand** | **⏰ 2026**

Made with ❤️ for Thammasat students
