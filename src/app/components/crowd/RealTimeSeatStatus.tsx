import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Armchair, UserCheck, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Button } from '../ui/button';

interface ZoneData {
  id: string;
  location_id: string;
  location: string;
  total_seats: number;
  sitting_count: number;
  available_chairs: number;
  standing_count: number;
  updated_at: string;
}

export function RealTimeSeatStatus() {
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchZones();

    // Subscribe to real-time updates for all seat status changes
    const channel = supabase
      .channel('all_seat_status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seat_status'
        },
        () => {
          console.log('🔔 [RealTimeSeatStatus] Real-time update received');
          fetchZones();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchZones = async () => {
    try {
      console.log('🟢 [RealTimeSeatStatus] Fetching seat status data for all locations');

      const { data, error} = await supabase
        .from('seat_status')
        .select('*')
        .in('location_id', ['1', '2'])
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ [RealTimeSeatStatus] Error:', error);
        return;
      }

      if (data) {
        // Get only the latest entry for each zone name (Zone A, Zone B)
        const latestZones = new Map<string, ZoneData>();
        data.forEach(zone => {
          if (!latestZones.has(zone.location)) {
            latestZones.set(zone.location, zone);
          }
        });

        const uniqueZones = Array.from(latestZones.values()).sort((a, b) =>
          a.location.localeCompare(b.location, 'th')
        );

        console.log('✅ [RealTimeSeatStatus] Loaded latest zones:', uniqueZones.length);
        setZones(uniqueZones);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('❌ [RealTimeSeatStatus] Exception:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateOccupancyRate = (occupied: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((occupied / total) * 100);
  };

  const getOccupancyColor = (rate: number) => {
    if (rate < 40) return '#10B981';
    if (rate < 75) return '#F59E0B';
    return '#EF4444';
  };

  const getOccupancyStatus = (rate: number) => {
    if (rate < 40) return 'ว่าง';
    if (rate < 75) return 'ปานกลาง';
    return 'เต็ม';
  };

  const totalSeats = zones.reduce((sum, zone) => sum + zone.total_seats, 0);
  const totalOccupied = zones.reduce((sum, zone) => sum + zone.sitting_count, 0);
  const totalAvailable = zones.reduce((sum, zone) => sum + zone.available_chairs, 0);
  const totalStanding = zones.reduce((sum, zone) => sum + zone.standing_count, 0);
  const overallRate = totalSeats > 0 ? calculateOccupancyRate(totalOccupied, totalSeats) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF9F5' }}>
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#6B4F3A] border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลที่นั่ง...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9F5' }}>
      {/* Header */}
      <header className="text-white border-b" style={{ backgroundColor: '#6B4F3A', borderColor: '#5C3D2E' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">ระบบติดตามที่นั่งแบบเรียลไทม์</h1>
              <p className="text-white/80 mt-1">หอสมุดป๋วย อึ้งภากรณ์ ชั้น 2</p>
            </div>
            <Button
              onClick={fetchZones}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              รีเฟรช
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Overall Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border-2 shadow-lg"
            style={{ borderColor: '#D3D1C7' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl" style={{ backgroundColor: '#F1EFE8' }}>
                  <Users className="w-6 h-6" style={{ color: '#6B4F3A' }} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">สรุปรวมทั้งหมด</div>
                  <div className="text-2xl font-bold text-black">{overallRate}% ใช้งาน</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>อัพเดท {lastUpdate.toLocaleTimeString('th-TH')}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: '#F1EFE8' }}>
                <div className="text-3xl font-bold text-black">{totalOccupied}</div>
                <div className="text-sm text-gray-600 mt-1">ที่นั่งมีคน</div>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: '#E8F5E9' }}>
                <div className="text-3xl font-bold" style={{ color: '#10B981' }}>{totalAvailable}</div>
                <div className="text-sm text-gray-600 mt-1">ที่นั่งว่าง</div>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: '#FFF3E0' }}>
                <div className="text-3xl font-bold" style={{ color: '#F59E0B' }}>{totalStanding}</div>
                <div className="text-sm text-gray-600 mt-1">คนยืน/เดิน</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>ความหนาแน่น</span>
                <span className="font-medium" style={{ color: getOccupancyColor(overallRate) }}>
                  {getOccupancyStatus(overallRate)}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallRate}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: getOccupancyColor(overallRate) }}
                />
              </div>
            </div>
          </motion.div>

          {/* Individual Zones */}
          {zones.length === 0 ? (
            <div className="text-center py-12">
              <Armchair className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">ไม่พบข้อมูลที่นั่ง</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {zones.map((zone, index) => {
                const occupancyRate = calculateOccupancyRate(zone.sitting_count, zone.total_seats);
                const color = getOccupancyColor(occupancyRate);
                const status = getOccupancyStatus(occupancyRate);

                return (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 border-2 shadow-lg hover:shadow-xl transition-shadow"
                    style={{ borderColor: '#D3D1C7' }}
                  >
                    {/* Zone Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: color + '20' }}>
                          <Armchair className="w-5 h-5" style={{ color }} />
                        </div>
                        <div>
                          <div className="font-bold text-lg text-black">{zone.location}</div>
                          <div className="text-sm text-gray-500">
                            {zone.total_seats} ที่นั่งทั้งหมด
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color }}>
                          {occupancyRate}%
                        </div>
                        <div className="text-xs font-medium" style={{ color }}>
                          {status}
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#F1EFE8' }}>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <UserCheck className="w-4 h-4" />
                          <span>มีคนนั่ง</span>
                        </div>
                        <div className="text-2xl font-bold text-black">{zone.sitting_count}</div>
                      </div>
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#E8F5E9' }}>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Armchair className="w-4 h-4" />
                          <span>ที่ว่าง</span>
                        </div>
                        <div className="text-2xl font-bold" style={{ color: '#10B981' }}>
                          {zone.available_chairs}
                        </div>
                      </div>
                    </div>

                    {/* Standing People */}
                    {zone.standing_count > 0 && (
                      <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: '#FFF3E0' }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>คนยืน/เดิน</span>
                          </div>
                          <div className="text-xl font-bold" style={{ color: '#F59E0B' }}>
                            {zone.standing_count} คน
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${occupancyRate}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>อัพเดทแบบเรียลไทม์</span>
                      </div>
                      <span>{new Date(zone.updated_at).toLocaleTimeString('th-TH')}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="bg-white rounded-xl p-4 border" style={{ borderColor: '#D3D1C7' }}>
            <div className="text-sm font-medium text-gray-700 mb-3">สถานะความหนาแน่น</div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                <span className="text-sm text-gray-600">ว่าง (&lt;40%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
                <span className="text-sm text-gray-600">ปานกลาง (40-74%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
                <span className="text-sm text-gray-600">เต็ม (≥75%)</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
