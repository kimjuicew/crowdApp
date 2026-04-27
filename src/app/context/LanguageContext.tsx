import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'th' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  th: {
    // Common
    'app.name': 'CrowdWatch',
    'app.tagline': 'Live · อัพเดทเมื่อสักครู่',
    'loading': 'กำลังโหลด...',
    'save': 'บันทึก',
    'cancel': 'ยกเลิก',
    'close': 'ปิด',
    'back': 'กลับ',
    'logout': 'ออกจากระบบ',

    // Dashboard
    'dashboard.title': 'CrowdWatch',
    'dashboard.notifications': 'การแจ้งเตือน',
    'dashboard.profile': 'โปรไฟล์',
    'dashboard.events': 'กิจกรรม',

    // Density
    'density.low': 'ว่าง',
    'density.medium': 'ปานกลาง',
    'density.high': 'แน่น',

    // Profile
    'profile.title': 'บัญชีของฉัน',
    'profile.subtitle': 'จัดการข้อมูลและการตั้งค่า',
    'profile.edit': 'แก้ไขข้อมูลส่วนตัว',
    'profile.notifications': 'การแจ้งเตือน',
    'profile.language': 'ภาษา',
    'profile.theme': 'โหมดการแสดงผล',
    'profile.support': 'ช่วยเหลือและแจ้งปัญหา',
    'profile.favorites': 'สถานที่โปรดของคุณ',
    'profile.settings': 'การตั้งค่าและข้อมูล',

    // Notifications
    'notifications.title': 'การตั้งค่าการแจ้งเตือน',
    'notifications.enable': 'เปิดการแจ้งเตือน',
    'notifications.disable': 'ปิดการแจ้งเตือน',
    'notifications.description': 'รับการแจ้งเตือนเมื่อสถานที่ที่คุณติดตามมีความหนาแน่นต่ำ',
    'notifications.when': 'แจ้งเตือนเมื่อสถานที่ว่าง',
    'notifications.success.on': 'เปิดการแจ้งเตือนแล้ว',
    'notifications.success.off': 'ปิดการแจ้งเตือนแล้ว',

    // Language
    'language.title': 'เลือกภาษา',
    'language.thai': 'ภาษาไทย',
    'language.english': 'English',

    // Theme
    'theme.title': 'โหมดการแสดงผล',
    'theme.light': 'โหมดสว่าง',
    'theme.dark': 'โหมดมืด',
    'theme.auto': 'ตามระบบ',

    // Chat
    'chat.title': 'ช่วยเหลือและแจ้งปัญหา',
    'chat.subtitle': 'ติดต่อผู้ดูแลระบบ',
    'chat.placeholder': 'พิมพ์ข้อความ...',
    'chat.send': 'ส่ง',
    'chat.empty': 'ยังไม่มีข้อความ',
    'chat.empty.desc': 'เริ่มต้นการสนทนากับผู้ดูแลระบบ',

    // Location Detail
    'location.currentStatus': 'สถานะปัจจุบัน',
    'location.people': 'จำนวนคน',
    'location.capacity': 'ความจุ',
    'location.hourlyDensity': 'ความหนาแน่นตลอดทั้งวัน',
    'location.currentTime': 'เวลาปัจจุบัน',
    'location.notifyWhenEmpty': 'แจ้งเตือนเมื่อว่าง',
    'location.enableNotification': 'เปิดการแจ้งเตือน',
    'location.disableNotification': 'ปิดการแจ้งเตือน',
    'location.follow': 'ติดตามสถานที่',
    'location.unfollow': 'เลิกติดตาม',
    'location.predict': 'ทำนายจำนวนคน',
    'location.predict.button': 'ดูการทำนาย 7 วัน',
    'location.info': 'ข้อมูลสถานที่',
    'location.category': 'ประเภท',
    'location.maxCapacity': 'ความจุสูงสุด',
    'location.status': 'สถานะ',
  },
  en: {
    // Common
    'app.name': 'CrowdWatch',
    'app.tagline': 'Live · updated just now',
    'loading': 'Loading...',
    'save': 'Save',
    'cancel': 'Cancel',
    'close': 'Close',
    'back': 'Back',
    'logout': 'Logout',

    // Dashboard
    'dashboard.title': 'CrowdWatch',
    'dashboard.notifications': 'Notifications',
    'dashboard.profile': 'Profile',
    'dashboard.events': 'Events',

    // Density
    'density.low': 'Available',
    'density.medium': 'Moderate',
    'density.high': 'Crowded',

    // Profile
    'profile.title': 'My Account',
    'profile.subtitle': 'Manage your information and settings',
    'profile.edit': 'Edit Personal Information',
    'profile.notifications': 'Notifications',
    'profile.language': 'Language',
    'profile.theme': 'Display Mode',
    'profile.support': 'Help & Support',
    'profile.favorites': 'Your Favorite Places',
    'profile.settings': 'Settings & Information',

    // Notifications
    'notifications.title': 'Notification Settings',
    'notifications.enable': 'Enable Notifications',
    'notifications.disable': 'Disable Notifications',
    'notifications.description': 'Receive notifications when your favorite places have low crowd density',
    'notifications.when': 'Notify when available',
    'notifications.success.on': 'Notifications enabled',
    'notifications.success.off': 'Notifications disabled',

    // Language
    'language.title': 'Select Language',
    'language.thai': 'ภาษาไทย',
    'language.english': 'English',

    // Theme
    'theme.title': 'Display Mode',
    'theme.light': 'Light Mode',
    'theme.dark': 'Dark Mode',
    'theme.auto': 'System Default',

    // Chat
    'chat.title': 'Help & Support',
    'chat.subtitle': 'Contact Admin',
    'chat.placeholder': 'Type a message...',
    'chat.send': 'Send',
    'chat.empty': 'No messages yet',
    'chat.empty.desc': 'Start a conversation with the admin',

    // Location Detail
    'location.currentStatus': 'Current Status',
    'location.people': 'People',
    'location.capacity': 'Capacity',
    'location.hourlyDensity': 'Hourly Density',
    'location.currentTime': 'Current Time',
    'location.notifyWhenEmpty': 'Notify When Available',
    'location.enableNotification': 'Enable Notification',
    'location.disableNotification': 'Disable Notification',
    'location.follow': 'Follow Location',
    'location.unfollow': 'Unfollow',
    'location.predict': 'Predict Crowd',
    'location.predict.button': 'View 7-Day Prediction',
    'location.info': 'Location Information',
    'location.category': 'Category',
    'location.maxCapacity': 'Max Capacity',
    'location.status': 'Status',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'th';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
