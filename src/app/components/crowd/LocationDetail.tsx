import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Users,
  Clock,
  Bell,
  BellOff,
  TrendingUp,
  MapPin,
  Lightbulb,
  Star,
  BarChart3
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  getDensityColor,
  getDensityLabel,
  getDensityBg,
  type Location
} from '../../data/mockData';
import { useLocations } from '../../context/LocationContext';
import { Button } from '../ui/button';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { LibraryZones } from './LibraryZones';
import { PredictionModal } from './PredictionModal';
const locationImages: Record<string, string> = {
  '1': '/ROOM-TU.jpg',
  '2': '/TU-FITNESS.jpg',
  '3': '/TU-JC.jpg',
  '4': '/TU-COM.jpg',
  '5': '/TU-Swim.jpg',
  '6': '/ROOM-TU.jpg', // หอสมุดป๋วยชั้น 2 ใช้รูปเดียวกับชั้น 1
};

export function LocationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { locations } = useLocations();
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [actualCount, setActualCount] = useState<number | null>(null);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [showPredictionModal, setShowPredictionModal] = useState(false);

  const location = locations.find(loc => loc.id === id);
  const suggestions = locations.filter(
    loc => loc.id !== id && loc.category === location?.category && loc.currentDensity === 'low'
  ).slice(0, 3);

  // Load seat status for Library Floor 2 (id='6')
  useEffect(() => {
    const fetchSeatCount = async () => {
      if (id === '6') {
        try {
          const { data, error } = await supabase
            .from('seat_status')
            .select('*')
            .in('location_id', ['1', '2'])
            .order('updated_at', { ascending: false });

          if (!error && data) {
            // Get latest entry for each zone
            const latestZones = new Map();
            data.forEach(zone => {
              if (!latestZones.has(zone.location)) {
                latestZones.set(zone.location, zone);
              }
            });

            // Calculate total people: sum of (sitting_count + standing_count) for all zones
            const total = Array.from(latestZones.values()).reduce(
              (sum, zone) => sum + zone.sitting_count + zone.standing_count,
              0
            );
            setActualCount(total);
          }
        } catch (err) {
          console.error('Error fetching seat count:', err);
        }
      }
    };

    const fetchHourlyData = async () => {
      if (id === '6') {
        try {
          // Get today's data
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const { data, error } = await supabase
            .from('seat_status')
            .select('*')
            .in('location_id', ['1', '2'])
            .gte('updated_at', today.toISOString())
            .order('updated_at', { ascending: true });

          if (!error && data && data.length > 0) {
            // Group by hour
            const hourlyMap = new Map();

            data.forEach(record => {
              const recordDate = new Date(record.updated_at);
              const hour = recordDate.getHours();

              if (!hourlyMap.has(hour)) {
                hourlyMap.set(hour, []);
              }
              hourlyMap.get(hour).push(record);
            });

            // Calculate total for each hour
            const hourlyArray = [];
            for (let hour = 0; hour < 24; hour++) {
              const records = hourlyMap.get(hour) || [];

              if (records.length > 0) {
                // Get latest entry for each zone in this hour
                const latestInHour = new Map();
                records.forEach(record => {
                  const existing = latestInHour.get(record.location);
                  if (!existing || new Date(record.updated_at) > new Date(existing.updated_at)) {
                    latestInHour.set(record.location, record);
                  }
                });

                // Sum up sitting + standing for both zones
                const total = Array.from(latestInHour.values()).reduce(
                  (sum, zone) => sum + zone.sitting_count + zone.standing_count,
                  0
                );

                const percentage = location?.capacity ? (total / location.capacity) * 100 : 0;
                let density: 'low' | 'medium' | 'high' = 'low';
                if (percentage >= 75) density = 'high';
                else if (percentage >= 40) density = 'medium';

                hourlyArray.push({ hour, count: total, density });
              } else {
                // No data for this hour
                hourlyArray.push({ hour, count: 0, density: 'low' as const });
              }
            }

            setHourlyData(hourlyArray);
          } else {
            // No data today, use empty data
            const emptyData = Array.from({ length: 24 }, (_, i) => ({
              hour: i,
              count: 0,
              density: 'low' as const
            }));
            setHourlyData(emptyData);
          }
        } catch (err) {
          console.error('Error fetching hourly data:', err);
        }
      }
    };

    fetchSeatCount();
    fetchHourlyData();

    // Subscribe to real-time updates for Library Floor 2
    if (id === '6') {
      const channel = supabase
        .channel('seat_status_location_detail')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'seat_status'
          },
          () => {
            fetchSeatCount();
            fetchHourlyData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id, location?.capacity]);

  // Load user data and check favorite/notification status
  useEffect(() => {
    const loadUserData = async () => {
      const storedUserId = localStorage.getItem('userId');
      if (!storedUserId || !id) return;

      setUserId(storedUserId);

      try {
        // Check if location is in favorites
        const { data: favoriteData } = await supabase
          .from('user_favorites')
          .select('*')
          .eq('user_id', storedUserId)
          .eq('location_id', id)
          .single();

        setIsFavorite(!!favoriteData);

        // Check if notifications are enabled for this location
        const { data: userData } = await supabase
          .from('users')
          .select('notify_when_empty')
          .eq('id', storedUserId)
          .single();

        if (userData?.notify_when_empty) {
          setNotifyEnabled(userData.notify_when_empty.includes(id));
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };

    loadUserData();
  }, [id]);

  const handleToggleNotification = async () => {
    if (!userId || !id) return;

    try {
      // Get current notify_when_empty array
      const { data: userData } = await supabase
        .from('users')
        .select('notify_when_empty')
        .eq('id', userId)
        .single();

      let updatedArray = userData?.notify_when_empty || [];

      if (notifyEnabled) {
        // Remove from array
        updatedArray = updatedArray.filter((locId: string) => locId !== id);
      } else {
        // Add to array
        if (!updatedArray.includes(id)) {
          updatedArray.push(id);
        }
      }

      // Update in database
      const { error } = await supabase
        .from('users')
        .update({ notify_when_empty: updatedArray })
        .eq('id', userId);

      if (error) {
        console.error('Error updating notifications:', error);
        toast.error('เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือน');
        return;
      }

      setNotifyEnabled(!notifyEnabled);
      toast.success(notifyEnabled ? 'ปิดการแจ้งเตือนแล้ว' : 'เปิดการแจ้งเตือนแล้ว');
    } catch (err) {
      console.error('Error toggling notification:', err);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const handleToggleFavorite = async () => {
    if (!userId || !id) return;

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('location_id', id);

        if (error) {
          console.error('Error removing favorite:', error);
          toast.error('เกิดข้อผิดพลาดในการลบจากรายการโปรด');
          return;
        }

        setIsFavorite(false);
        toast.success('ลบจากรายการโปรดแล้ว');
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: userId,
            location_id: id
          });

        if (error) {
          console.error('Error adding favorite:', error);
          toast.error('เกิดข้อผิดพลาดในการเพิ่มรายการโปรด');
          return;
        }

        setIsFavorite(true);
        toast.success('เพิ่มลงรายการโปรดแล้ว');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">กำลังโหลด...</div>
      </div>
    );
  }

  // Use actual count from seat_status for Library Floor 2, otherwise use location.currentCount
  const displayCount = location.id === '6' && actualCount !== null ? actualCount : location.currentCount;
  const percentage = Math.round((displayCount / location.capacity) * 100);
  const currentHour = new Date().getHours();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9F5' }}>
      <div className="relative h-80 overflow-hidden">
        <img
          src={locationImages[location.id]}
          alt={location.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23F1EFE8" width="800" height="600"/%3E%3Ctext fill="%236B4F3A" font-family="sans-serif" font-size="32" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E' + encodeURIComponent(location.name) + '%3C/text%3E%3C/svg%3E';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-transparent"></div>

        <div className="absolute top-0 left-0 right-0 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-white text-4xl font-bold mb-2">{location.name}</h1>
              <p className="text-white/80 text-lg">{location.category}</p>
            </motion.div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border"
              style={{ borderColor: '#D3D1C7' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium text-black">สถานะปัจจุบัน</h2>
                <div
                  className={`px-4 py-2 rounded-full text-sm border-2 ${getDensityBg(location.currentDensity)}`}
                  style={{
                    backgroundColor: `${getDensityColor(location.currentDensity)}20`,
                    borderColor: getDensityColor(location.currentDensity),
                    color: getDensityColor(location.currentDensity)
                  }}
                >
                  {getDensityLabel(location.currentDensity)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">จำนวนคน</span>
                  </div>
                  <div className="text-3xl">{displayCount}</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">ความจุ</span>
                  </div>
                  <div className="text-3xl">{location.capacity}</div>
                </div>
              </div>

              <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: getDensityColor(location.currentDensity) }}
                />
              </div>
              <div className="text-right text-sm text-gray-600 mt-2">{percentage}% ของความจุ</div>
            </motion.div>

            {/* Library Zones - For Puey Library Floor 2 (id='6') */}
            {location.id === '6' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl p-6 shadow-sm border"
                style={{ borderColor: '#D3D1C7' }}
              >
                <LibraryZones locationId="1" locationName={location.name} />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border"
              style={{ borderColor: '#D3D1C7' }}
            >
              <h2 className="text-xl font-medium text-black mb-6">ความหนาแน่นตลอดทั้งวัน</h2>

              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={location.id === '6' && hourlyData.length > 0 ? hourlyData : location.hourlyData}>
                  <defs>
                    <linearGradient id={`colorCount-${location.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6B4F3A" stopOpacity={0.3} key={`stop-start-${location.id}`} />
                      <stop offset="95%" stopColor="#6B4F3A" stopOpacity={0} key={`stop-end-${location.id}`} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(hour) => `${hour}:00`}
                    stroke="#999"
                  />
                  <YAxis stroke="#999" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border">
                            <div className="text-sm mb-1">เวลา {data.hour}:00</div>
                            <div className="font-medium">{data.count} คน</div>
                            <div
                              className="text-sm mt-1"
                              style={{ color: getDensityColor(data.density) }}
                            >
                              {getDensityLabel(data.density)}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#6B4F3A"
                    strokeWidth={2}
                    fill={`url(#colorCount-${location.id})`}
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>เวลาปัจจุบัน: {currentHour}:00 น.</span>
                {location.id === '6' && (
                  <span className="ml-auto text-xs" style={{ color: '#6B4F3A' }}>
                    • ข้อมูลเรียลไทม์จากระบบติดตาม
                  </span>
                )}
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border"
              style={{ borderColor: '#D3D1C7' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-black">แจ้งเตือนเมื่อว่าง</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleNotification}
                >
                  {notifyEnabled ? (
                    <Bell className="w-5 h-5" strokeWidth={1.5} style={{ color: '#6B4F3A', fill: '#6B4F3A'}} />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                  )}
                </Button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                รับการแจ้งเตือนเมื่อสถานที่นี้เริ่มว่างและเหมาะที่จะมาใช้บริการ
              </p>

              <Button
                onClick={handleToggleNotification}
                className="w-full"
                style={{
                  backgroundColor: notifyEnabled ? '#9CA3AF' : '#6B4F3A',
                  color: '#FAF0E6'
                }}
              >
                {notifyEnabled ? 'ปิดการแจ้งเตือน' : 'เปิดการแจ้งเตือน'}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl p-6 shadow-sm border"
              style={{ borderColor: '#D3D1C7' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-black">ติดตามสถานที่</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFavorite}
                >
                  <Star
                    className="w-5 h-5"
                    strokeWidth={1.5}
                    style={{
                      color: '#6B4F3A',
                      fill: isFavorite ? '#6B4F3A' : 'none'
                    }}
                  />
                </Button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                เพิ่มสถานที่นี้ในรายการโปรดเพื่อเข้าถึงได้รวดเร็ว
              </p>

              <Button
                onClick={handleToggleFavorite}
                className="w-full"
                style={{
                  backgroundColor: isFavorite ? '#9CA3AF' : '#6B4F3A',
                  color: '#FAF0E6'
                }}
              >
                {isFavorite ? 'เลิกติดตาม' : 'ติดตามสถานที่'}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-blue-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-blue-900">ทำนายจำนวนคน</h3>
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>

              <p className="text-sm text-blue-800 mb-4">
                ดูการคาดการณ์จำนวนคนในวันต่อๆ ไปด้วย AI
              </p>

              <Button
                onClick={() => setShowPredictionModal(true)}
                className="w-full"
                style={{
                  backgroundColor: '#3B82F6',
                  color: '#FFFFFF'
                }}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                ดูการทำนาย 7 วัน
              </Button>
            </motion.div>

            {suggestions.length > 0 && location.currentDensity === 'high' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-sm border border-amber-200"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg text-amber-900">คำแนะนำสถานที่ทางเลือก</h3>
                </div>

                <p className="text-sm text-amber-800 mb-4">
                  สถานที่นี้กำลังแน่น ลองพิจารณาสถานที่เหล่านี้แทน:
                </p>

                <div className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => navigate(`/location/${suggestion.id}`)}
                      className="w-full p-3 bg-white rounded-xl border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">
                          {suggestion.name}
                        </div>
                        <div
                          className="px-2 py-1 rounded-full text-xs"
                          style={{
                            backgroundColor: `${getDensityColor(suggestion.currentDensity)}20`,
                            color: getDensityColor(suggestion.currentDensity)
                          }}
                        >
                          {getDensityLabel(suggestion.currentDensity)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-3 h-3" />
                        <span>{suggestion.currentCount} / {suggestion.capacity} คน</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl p-6 shadow-sm border"
              style={{ borderColor: '#D3D1C7' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5" strokeWidth={1.5} style={{ color: '#6B4F3A' }} />
                <h3 className="text-lg font-medium text-black">ข้อมูลสถานที่</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ประเภท:</span>
                  <span className="font-medium">{location.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ความจุสูงสุด:</span>
                  <span className="font-medium">{location.capacity} คน</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">สถานะ:</span>
                  <span style={{ color: getDensityColor(location.currentDensity) }}>
                    {getDensityLabel(location.currentDensity)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Prediction Modal */}
      <PredictionModal
        isOpen={showPredictionModal}
        onClose={() => setShowPredictionModal(false)}
        locationId={location.id}
        locationName={location.name}
        capacity={location.capacity}
      />
    </div>
  );
}
