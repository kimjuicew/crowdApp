import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Moon, Sun, Monitor, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export function ThemeSettings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  const themes = [
    { value: 'light' as const, label: t('theme.light'), icon: Sun },
    { value: 'dark' as const, label: t('theme.dark'), icon: Moon },
    { value: 'auto' as const, label: t('theme.auto'), icon: Monitor }
  ];

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
              <h1 className="text-2xl font-bold text-black dark:text-white">{t('theme.title')}</h1>
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
              <Moon className="w-6 h-6 dark:text-gray-300" style={{ color: '#6B4F3A' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-black dark:text-white">{t('theme.title')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Choose your display theme</p>
            </div>
          </div>

          <div className="space-y-3">
            {themes.map(themeOption => {
              const Icon = themeOption.icon;
              return (
                <button
                  key={themeOption.value}
                  onClick={() => setTheme(themeOption.value)}
                  className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                    theme === themeOption.value
                      ? 'border-[#6B4F3A] dark:border-[#8B6F5A] bg-[#F1EFE8] dark:bg-gray-700'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
                    <span className="font-medium text-black dark:text-white">{themeOption.label}</span>
                  </div>
                  {theme === themeOption.value && (
                    <Check className="w-5 h-5 dark:text-gray-300" style={{ color: '#6B4F3A' }} strokeWidth={2.5} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              💡 โหมด "ตามระบบ" จะปรับเปลี่ยนตามการตั้งค่าของอุปกรณ์ของคุณโดยอัตโนมัติ
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
