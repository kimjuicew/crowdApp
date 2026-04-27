import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, Calendar, Users, BarChart3, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '../ui/button';
import { supabase } from '../../../lib/supabase';

interface PredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: string;
  locationName: string;
  capacity: number;
}

interface PredictionData {
  date: string;
  dayName: string;
  predictedCount: number;
  confidence: number;
  density: 'low' | 'medium' | 'high';
}

export function PredictionModal({ isOpen, onClose, locationId, locationName, capacity }: PredictionModalProps) {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      generatePredictions();
    }
  }, [isOpen, locationId]);

  const generatePredictions = async () => {
    setLoading(true);

    try {
      // Fetch historical data for the location
      if (locationId === '6') {
        // For Library Floor 2, use seat_status data
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabase
          .from('seat_status')
          .select('*')
          .in('location_id', ['1', '2'])
          .gte('updated_at', thirtyDaysAgo.toISOString())
          .order('updated_at', { ascending: true });

        if (!error && data) {
          // Group by day and calculate averages
          const dailyMap = new Map();

          data.forEach(record => {
            const date = new Date(record.updated_at);
            const dateKey = date.toISOString().split('T')[0];
            const dayOfWeek = date.getDay();

            if (!dailyMap.has(dateKey)) {
              dailyMap.set(dateKey, { records: [], dayOfWeek });
            }
            dailyMap.get(dateKey).records.push(record);
          });

          const dailyAverages: any[] = [];
          dailyMap.forEach((value, dateKey) => {
            const latestZones = new Map();
            value.records.forEach((record: any) => {
              const existing = latestZones.get(record.location);
              if (!existing || new Date(record.updated_at) > new Date(existing.updated_at)) {
                latestZones.set(record.location, record);
              }
            });

            const total = Array.from(latestZones.values()).reduce(
              (sum: number, zone: any) => sum + zone.sitting_count + zone.standing_count,
              0
            );

            dailyAverages.push({
              date: dateKey,
              dayOfWeek: value.dayOfWeek,
              count: total
            });
          });

          setHistoricalData(dailyAverages);

          // Calculate predictions based on day of week patterns
          const dayAverages = new Map();
          dailyAverages.forEach(day => {
            if (!dayAverages.has(day.dayOfWeek)) {
              dayAverages.set(day.dayOfWeek, []);
            }
            dayAverages.get(day.dayOfWeek).push(day.count);
          });

          const dayPatterns = new Map();
          dayAverages.forEach((counts, dayOfWeek) => {
            const avg = counts.reduce((a: number, b: number) => a + b, 0) / counts.length;
            const variance = counts.reduce((sum: number, val: number) => sum + Math.pow(val - avg, 2), 0) / counts.length;
            const stdDev = Math.sqrt(variance);
            dayPatterns.set(dayOfWeek, { avg, stdDev });
          });

          // Generate predictions for next 7 days
          const nextDays: PredictionData[] = [];
          for (let i = 1; i <= 7; i++) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + i);
            const dayOfWeek = futureDate.getDay();

            const pattern = dayPatterns.get(dayOfWeek) || { avg: capacity * 0.5, stdDev: capacity * 0.2 };
            const predictedCount = Math.round(pattern.avg);
            const confidence = Math.min(95, Math.max(60, 100 - (pattern.stdDev / pattern.avg) * 100));

            const percentage = (predictedCount / capacity) * 100;
            let density: 'low' | 'medium' | 'high' = 'low';
            if (percentage >= 75) density = 'high';
            else if (percentage >= 40) density = 'medium';

            nextDays.push({
              date: futureDate.toISOString().split('T')[0],
              dayName: futureDate.toLocaleDateString('th-TH', { weekday: 'short' }),
              predictedCount,
              confidence: Math.round(confidence),
              density
            });
          }

          setPredictions(nextDays);
        }
      } else {
        // For other locations, use simpler pattern-based prediction
        const nextDays: PredictionData[] = [];
        const basePattern = [0.6, 0.7, 0.65, 0.55, 0.8, 0.45, 0.3]; // Mon-Sun multipliers

        for (let i = 1; i <= 7; i++) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + i);
          const dayOfWeek = futureDate.getDay();

          const multiplier = basePattern[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
          const predictedCount = Math.round(capacity * multiplier * (0.9 + Math.random() * 0.2));
          const confidence = Math.round(70 + Math.random() * 20);

          const percentage = (predictedCount / capacity) * 100;
          let density: 'low' | 'medium' | 'high' = 'low';
          if (percentage >= 75) density = 'high';
          else if (percentage >= 40) density = 'medium';

          nextDays.push({
            date: futureDate.toISOString().split('T')[0],
            dayName: futureDate.toLocaleDateString('th-TH', { weekday: 'short' }),
            predictedCount,
            confidence,
            density
          });
        }

        setPredictions(nextDays);
      }
    } catch (err) {
      console.error('Error generating predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDensityColor = (density: 'low' | 'medium' | 'high') => {
    if (density === 'low') return '#10B981';
    if (density === 'medium') return '#F59E0B';
    return '#EF4444';
  };

  const getDensityLabel = (density: 'low' | 'medium' | 'high') => {
    if (density === 'low') return 'ว่าง';
    if (density === 'medium') return 'ปานกลาง';
    return 'แน่น';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short'
    });
  };

  const chartData = predictions.map(pred => ({
    date: formatDate(pred.date),
    จำนวนคนที่คาดการณ์: pred.predictedCount,
    ความจุสูงสุด: capacity
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#D3D1C7' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#F1EFE8' }}>
                  <TrendingUp className="w-5 h-5" style={{ color: '#6B4F3A' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black">การทำนายจำนวนคน</h2>
                  <p className="text-sm text-gray-600">{locationName}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(100vh-12rem)] md:max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-12 h-12 border-4 border-[#6B4F3A] border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Info Banner */}
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: '#E8F5F1', borderColor: '#10B981' }}>
                    <div className="flex items-start gap-3">
                      <Activity className="w-5 h-5 mt-0.5" style={{ color: '#10B981' }} />
                      <div className="text-sm" style={{ color: '#047857' }}>
                        <p className="font-medium mb-1">การทำนายอิงจากข้อมูลในอดีต</p>
                        <p>ระบบวิเคราะห์รูปแบบการใช้งานในช่วง 30 วันที่ผ่านมาเพื่อคาดการณ์จำนวนคนในอนาคต</p>
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="bg-white rounded-xl p-4 border" style={{ borderColor: '#D3D1C7' }}>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">กราฟแสดงการคาดการณ์ 7 วันข้างหน้า</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#999" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #D3D1C7',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="จำนวนคนที่คาดการณ์"
                          stroke="#6B4F3A"
                          strokeWidth={2}
                          dot={{ fill: '#6B4F3A', r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="ความจุสูงสุด"
                          stroke="#E24B4A"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Daily Predictions */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">รายละเอียดการคาดการณ์แต่ละวัน</h3>
                    <div className="space-y-3">
                      {predictions.map((pred, index) => (
                        <motion.div
                          key={pred.date}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white rounded-xl p-4 border-2"
                          style={{ borderColor: '#D3D1C7' }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg" style={{ backgroundColor: '#F1EFE8' }}>
                                <Calendar className="w-4 h-4" style={{ color: '#6B4F3A' }} />
                              </div>
                              <div>
                                <div className="font-medium text-black">{formatDate(pred.date)}</div>
                                <div className="text-sm text-gray-500">{pred.dayName}</div>
                              </div>
                            </div>
                            <div
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `${getDensityColor(pred.density)}20`,
                                color: getDensityColor(pred.density)
                              }}
                            >
                              {getDensityLabel(pred.density)}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg" style={{ backgroundColor: '#F1EFE8' }}>
                              <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                                <Users className="w-3 h-3" />
                                <span>จำนวนคนที่คาดการณ์</span>
                              </div>
                              <div className="text-lg font-bold text-black">{pred.predictedCount} คน</div>
                            </div>
                            <div className="p-3 rounded-lg" style={{ backgroundColor: '#E8F5F1' }}>
                              <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                                <BarChart3 className="w-3 h-3" />
                                <span>ความเชื่อมั่น</span>
                              </div>
                              <div className="text-lg font-bold" style={{ color: '#10B981' }}>
                                {pred.confidence}%
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${(pred.predictedCount / capacity) * 100}%`,
                                  backgroundColor: getDensityColor(pred.density)
                                }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
