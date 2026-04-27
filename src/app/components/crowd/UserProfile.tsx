import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  User,
  Bell,
  MapPin,
  LogOut,
  ChevronRight,
  Globe,
  Moon,
  LifeBuoy,
  Star
} from 'lucide-react';
import { getDensityColor, getDensityLabel, type Location } from '../../data/mockData';
import { Button } from '../ui/button';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';

interface UserProfileProps {
  userId: string;
  onLogout: () => void;
}

interface UserData {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone: string;
}

export function UserProfile({ userId, onLogout }: UserProfileProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState<UserData | null>(null);
  const [favoriteLocations, setFavoriteLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      // Load user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        console.error('Error loading user:', userError);
        setLoading(false);
        return;
      }

      setUser(userData);

      // Load favorite locations
      const { data: favoritesData, error: favError } = await supabase
        .from('user_favorites')
        .select('location_id')
        .eq('user_id', userId);

      if (favError) {
        console.error('Error loading favorites:', favError);
        setLoading(false);
        return;
      }

      if (favoritesData && favoritesData.length > 0) {
        const locationIds = favoritesData.map(f => f.location_id);

        const { data: locationsData, error: locError } = await supabase
          .from('locations')
          .select('*')
          .in('id', locationIds);

        if (!locError && locationsData) {
          const transformedLocations: Location[] = locationsData.map(loc => ({
            id: loc.id,
            name: loc.name,
            nameEn: loc.name_en,
            category: loc.category,
            image: loc.image,
            currentDensity: loc.current_density as 'low' | 'medium' | 'high',
            currentCount: loc.current_count,
            capacity: loc.capacity,
            latitude: parseFloat(loc.latitude),
            longitude: parseFloat(loc.longitude),
            hourlyData: loc.hourly_data,
            adminId: loc.admin_id
          }));
          setFavoriteLocations(transformedLocations);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading user data:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">{t('loading')}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">ไม่พบข้อมูลผู้ใช้</div>
      </div>
    );
  }

  const settingsItems = [
    { icon: User, label: t('profile.edit'), onClick: () => navigate('/profile/edit') },
    { icon: Bell, label: t('profile.notifications'), onClick: () => navigate('/profile/notifications') },
    { icon: Globe, label: t('profile.language'), onClick: () => navigate('/profile/language') },
    { icon: Moon, label: t('profile.theme'), onClick: () => navigate('/profile/theme') },
    { icon: LifeBuoy, label: t('profile.support'), onClick: () => navigate('/profile/support') },
  ];

  return (
    <div className="min-h-screen dark:bg-gray-900" style={{ backgroundColor: '#FAF9F5' }}>
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700" style={{ borderColor: '#D3D1C7' }}>
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-white">{t('profile.title')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('profile.subtitle')}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Profile Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border dark:border-gray-700 text-center"
            style={{ borderColor: '#D3D1C7' }}
          >
            <div className="flex flex-col items-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-4 dark:bg-[#8B6F5A]"
                style={{ backgroundColor: '#6B4F3A' }}
              >
                <User className="w-12 h-12" strokeWidth={1.5} style={{ color: '#FAF0E6' }} />
              </div>
              <h2 className="text-2xl font-bold text-black dark:text-white">{user.full_name}</h2>
            </div>
          </motion.div>

          {/* Favorites Section */}
          {favoriteLocations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border dark:border-gray-700"
              style={{ borderColor: '#D3D1C7' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 dark:text-gray-300" strokeWidth={1.5} style={{ color: '#6B4F3A' }} />
                <h3 className="text-lg font-medium text-black dark:text-white">{t('profile.favorites')}</h3>
              </div>

              <div className="space-y-3">
                {favoriteLocations.map(location => (
                  <button
                    key={location.id}
                    onClick={() => navigate(`/location/${location.id}`)}
                    className="w-full p-4 rounded-xl border dark:border-gray-700 flex items-center justify-between hover:shadow-md transition-all dark:hover:bg-gray-700"
                    style={{ backgroundColor: '#F1EFE8' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg dark:bg-gray-600" style={{ backgroundColor: '#FAF9F5' }}>
                        <Star
                          className="w-5 h-5 dark:text-[#8B6F5A]"
                          strokeWidth={1.5}
                          style={{ color: '#6B4F3A', fill: '#6B4F3A' }}
                        />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-black dark:text-white">{location.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{location.category}</div>
                      </div>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getDensityColor(location.currentDensity)}20`,
                        color: getDensityColor(location.currentDensity)
                      }}
                    >
                      {getDensityLabel(location.currentDensity)}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Settings Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border dark:border-gray-700"
            style={{ borderColor: '#D3D1C7' }}
          >
            <h3 className="text-lg font-medium text-black dark:text-white mb-4">{t('profile.settings')}</h3>

            <div className="space-y-2">
              {settingsItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border dark:border-gray-700"
                  style={{ borderColor: '#D3D1C7' }}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className="w-5 h-5 dark:text-gray-300"
                      strokeWidth={1.5}
                      style={{ color: '#6B4F3A' }}
                    />
                    <span className="text-black dark:text-white font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Logout Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <Button
              onClick={onLogout}
              variant="outline"
              className="px-8 py-6 text-base hover:opacity-90 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-500/10"
              style={{
                borderColor: '#E24B4A',
                color: '#E24B4A'
              }}
            >
              <LogOut className="w-5 h-5 mr-2" strokeWidth={1.5} />
              {t('logout')}
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
