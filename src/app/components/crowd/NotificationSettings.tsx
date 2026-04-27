import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Bell, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { useLanguage } from '../../context/LanguageContext';

interface NotificationSettingsProps {
  userId: string;
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('notifications')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setNotificationsEnabled(data.notifications);
      }
    } catch (err) {
      console.error('Error loading notification settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ notifications: enabled })
        .eq('id', userId);

      if (error) {
        toast.error('เกิดข้อผิดพลาดในการบันทึก');
        return;
      }

      setNotificationsEnabled(enabled);
      toast.success(enabled ? t('notifications.success.on') : t('notifications.success.off'));
    } catch (err) {
      console.error('Error updating notifications:', err);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gray-900" style={{ backgroundColor: '#FAF9F5' }}>
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700" style={{ borderColor: '#D3D1C7' }}>
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-white">{t('notifications.title')}</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border dark:border-gray-700"
          style={{ borderColor: '#D3D1C7' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl dark:bg-gray-700" style={{ backgroundColor: '#F1EFE8' }}>
              <Bell className="w-6 h-6 dark:text-gray-300" style={{ color: '#6B4F3A' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-black dark:text-white">{t('notifications.when')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('notifications.description')}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleToggle(true)}
              className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                notificationsEnabled
                  ? 'border-[#6B4F3A] dark:border-[#8B6F5A] bg-[#F1EFE8] dark:bg-gray-700'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    notificationsEnabled
                      ? 'border-[#6B4F3A] dark:border-[#8B6F5A] bg-[#6B4F3A] dark:bg-[#8B6F5A]'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {notificationsEnabled && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                </div>
                <span className="font-medium text-black dark:text-white">{t('notifications.enable')}</span>
              </div>
            </button>

            <button
              onClick={() => handleToggle(false)}
              className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                !notificationsEnabled
                  ? 'border-[#6B4F3A] dark:border-[#8B6F5A] bg-[#F1EFE8] dark:bg-gray-700'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    !notificationsEnabled
                      ? 'border-[#6B4F3A] dark:border-[#8B6F5A] bg-[#6B4F3A] dark:bg-[#8B6F5A]'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {!notificationsEnabled && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                </div>
                <span className="font-medium text-black dark:text-white">{t('notifications.disable')}</span>
              </div>
            </button>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              💡 เมื่อเปิดการแจ้งเตือน คุณจะได้รับแจ้งเตือนเมื่อสถานที่ที่คุณติดตามมีความหนาแน่นต่ำ (สีเขียว)
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
