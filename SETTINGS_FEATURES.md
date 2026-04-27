# Settings & Features Documentation

## คุณสมบัติใหม่ในหน้าบัญชีของฉัน

### 1. การแจ้งเตือน (Notifications)
**เส้นทาง:** `/profile/notifications`

**คุณสมบัติ:**
- เปิด/ปิดการแจ้งเตือนทั้งหมด
- แจ้งเตือนเมื่อสถานที่ที่ติดตามมีความหนาแน่นต่ำ (สีเขียว)
- บันทึกการตั้งค่าใน Supabase (users.notifications)
- รองรับ Dark Mode

**การใช้งาน:**
1. เข้าหน้าบัญชีของฉัน
2. คลิก "การแจ้งเตือน"
3. เลือกเปิดหรือปิดการแจ้งเตือน

### 2. การเปลี่ยนภาษา (Language Settings)
**เส้นทาง:** `/profile/language`

**ภาษาที่รองรับ:**
- 🇹🇭 ภาษาไทย (th)
- 🇬🇧 English (en)

**คุณสมบัติ:**
- เปลี่ยนภาษาทั้งแอปพลิเคชั่น
- บันทึกการตั้งค่าใน localStorage
- อัพเดท UI ทันทีเมื่อเปลี่ยนภาษา
- รองรับ Dark Mode

**การเพิ่มภาษาใหม่:**
1. แก้ไข `src/app/context/LanguageContext.tsx`
2. เพิ่ม translations ในภาษาใหม่
3. เพิ่มตัวเลือกใน LanguageSettings component

### 3. โหมดการแสดงผล (Theme Settings)
**เส้นทาง:** `/profile/theme`

**โหมดที่รองรับ:**
- ☀️ โหมดสว่าง (Light Mode)
- 🌙 โหมดมืด (Dark Mode)
- 💻 ตามระบบ (Auto - ปรับตามการตั้งค่าอุปกรณ์)

**คุณสมบัติ:**
- เปลี่ยนธีมทั้งแอปพลิเคชั่น
- บันทึกการตั้งค่าใน localStorage
- โหมด Auto จะตรวจจับการตั้งค่าของ OS
- รองรับ dark mode ทุกหน้า

**การใช้งาน:**
1. เข้าหน้าบัญชีของฉัน
2. คลิก "โหมดการแสดงผล"
3. เลือกธีมที่ต้องการ

### 4. ช่วยเหลือและแจ้งปัญหา (Support Chat)
**เส้นทาง:** `/profile/support`

**คุณสมบัติ:**
- แชทสดกับผู้ดูแลระบบ (Admin)
- อัพเดทแบบเรียลไทม์ผ่าน Supabase Realtime
- แสดงสถานะอ่าน/ไม่อ่าน
- บันทึกประวัติการสนทนา
- รองรับ Dark Mode
- UI แบบ modern chat interface

**การใช้งาน:**
1. เข้าหน้าบัญชีของฉัน
2. คลิก "ช่วยเหลือและแจ้งปัญหา"
3. พิมพ์ข้อความและกด Enter หรือคลิกปุ่มส่ง
4. รอผู้ดูแลตอบกลับ

## Database Schema

### ตาราง messages
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    message TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    admin_id TEXT REFERENCES users(id),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

## การติดตั้ง

### 1. รัน Database Migration

```bash
# รันไฟล์ migration สำหรับตาราง messages
# supabase/migrations/005_add_messages_table.sql
```

### 2. ตรวจสอบ Dependencies

ตรวจสอบว่ามี packages เหล่านี้ใน package.json:
- `@supabase/supabase-js`
- `motion/react`
- `react-router`
- `sonner`

## Context Providers

### LanguageContext
**ตำแหน่ง:** `src/app/context/LanguageContext.tsx`

**API:**
- `language`: ภาษาปัจจุบัน ('th' | 'en')
- `setLanguage(lang)`: เปลี่ยนภาษา
- `t(key)`: ฟังก์ชันแปลข้อความ

**ตัวอย่างการใช้:**
```tsx
import { useLanguage } from '../../context/LanguageContext';

function MyComponent() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div>
      <h1>{t('profile.title')}</h1>
      <button onClick={() => setLanguage('en')}>
        Switch to English
      </button>
    </div>
  );
}
```

### ThemeContext
**ตำแหน่ง:** `src/app/context/ThemeContext.tsx`

**API:**
- `theme`: ธีมที่เลือก ('light' | 'dark' | 'auto')
- `setTheme(theme)`: เปลี่ยนธีม
- `effectiveTheme`: ธีมที่แสดงผลจริง ('light' | 'dark')

**ตัวอย่างการใช้:**
```tsx
import { useTheme } from '../../context/ThemeContext';

function MyComponent() {
  const { theme, setTheme, effectiveTheme } = useTheme();
  
  return (
    <div className={effectiveTheme === 'dark' ? 'dark-style' : 'light-style'}>
      <button onClick={() => setTheme('dark')}>
        Dark Mode
      </button>
    </div>
  );
}
```

## Routes ใหม่

- `/profile/notifications` - หน้าการตั้งค่าการแจ้งเตือน
- `/profile/language` - หน้าการเลือกภาษา
- `/profile/theme` - หน้าการเลือกธีม
- `/profile/support` - หน้าแชทกับ admin

## Components ใหม่

1. `NotificationSettings.tsx` - การตั้งค่าการแจ้งเตือน
2. `LanguageSettings.tsx` - การเลือกภาษา
3. `ThemeSettings.tsx` - การเลือกธีม
4. `SupportChat.tsx` - หน้าแชทกับ admin

## Dark Mode Support

ทุก component ใหม่รองรับ Dark Mode โดยใช้:
- Tailwind `dark:` variant
- CSS custom properties
- ThemeContext

**ตัวอย่าง:**
```tsx
<div className="bg-white dark:bg-gray-800 text-black dark:text-white">
  Content
</div>
```

## การแปลภาษา

เพิ่ม translation keys ใน `LanguageContext.tsx`:

```typescript
const translations = {
  th: {
    'key.name': 'ข้อความภาษาไทย',
  },
  en: {
    'key.name': 'English text',
  }
};
```

ใช้ใน component:
```tsx
const { t } = useLanguage();
<p>{t('key.name')}</p>
```

## Known Issues & Limitations

1. **Realtime Messages**: ต้องเปิด Realtime ใน Supabase Dashboard
2. **Notification System**: ยังไม่มีการส่ง push notification จริง (แค่เก็บ preference)
3. **Admin Chat Interface**: ยังไม่มีหน้า admin สำหรับตอบแชท (ต้องใช้ Supabase Dashboard)

## Future Improvements

- [ ] Push notifications จริงผ่าน Service Worker
- [ ] Admin chat interface
- [ ] เพิ่มภาษาอื่นๆ (จีน, ญี่ปุ่น, เกาหลี)
- [ ] Image/file upload ในแชท
- [ ] Typing indicator
- [ ] Read receipts
- [ ] Sound notifications
