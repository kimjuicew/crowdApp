import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Shield,
  LogOut,
  Bell,
  BellRing,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle,
  Edit,
  Save,
  X
} from 'lucide-react';
import {
  getDensityColor,
  getDensityLabel,
  getDensityBg,
  type Location
} from '../../data/mockData';
import { useLocations } from '../../context/LocationContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { DebugPanel } from './DebugPanel';
import { AdminZoneManager } from './AdminZoneManager';

interface AdminDashboardProps {
  userId: string;
  onLogout: () => void;
}

export function AdminDashboard({ userId, onLogout }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('Admin');
  const { locations, updateLocationCount, updateLocationCapacity } = useLocations();
  const [checkNotification, setCheckNotification] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(new Date());
  const [checkedLocations, setCheckedLocations] = useState<Set<string>>(new Set());
  const [library2Count, setLibrary2Count] = useState<number | null>(null);

  const managedLocations = locations; // Show all locations instead of filtering by adminId

  // Fetch actual count for Library Floor 2 from seat_status
  useEffect(() => {
    const fetchLibrary2Count = async () => {
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
            (sum: number, zone: any) => sum + zone.sitting_count + zone.standing_count,
            0
          );
          setLibrary2Count(total);
        }
      } catch (err) {
        console.error('Error fetching library 2 count:', err);
      }
    };

    fetchLibrary2Count();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('seat_status_admin_dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seat_status'
        },
        () => {
          fetchLibrary2Count();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Load admin data from Supabase
  useEffect(() => {
    const loadAdminData = async () => {
      const { data } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', userId)
        .single();

      if (data) {
        setAdminName(data.full_name);
      }
    };

    loadAdminData();
  }, [userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCheckNotification(true);
      setLastCheckTime(new Date());
      setCheckedLocations(new Set());
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCheckLocation = (locationId: string) => {
    setCheckedLocations(prev => new Set(prev).add(locationId));

    if (checkedLocations.size + 1 === managedLocations.length) {
      setCheckNotification(false);
    }
  };

  const totalCapacity = managedLocations.reduce((sum, loc) => sum + loc.capacity, 0);
  const totalCurrent = managedLocations.reduce((sum, loc) => sum + loc.currentCount, 0);
  const averagePercentage = Math.round((totalCurrent / totalCapacity) * 100);

  const highDensityLocations = managedLocations.filter(loc => loc.currentDensity === 'high');
  const lowDensityLocations = managedLocations.filter(loc => loc.currentDensity === 'low');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9F5' }}>
      <header className="text-white border-b" style={{ backgroundColor: '#6B4F3A', borderColor: '#5C3D2E' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <Shield className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-white/70">{adminName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-5 h-5" strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {checkNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border-b border-amber-200"
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-3">
              <BellRing className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
              <div className="flex-1">
                <div className="font-medium text-amber-900">
                  ถึงเวลาตรวจสอบสถานที่แล้ว!
                </div>
                <div className="text-sm text-amber-700">
                  กรุณาตรวจสอบและอัพเดทข้อมูลความหนาแน่นของสถานที่ทั้งหมด ({checkedLocations.size}/{locations.length})
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border"
            style={{ borderColor: '#D3D1C7' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#F1EFE8' }}>
                <Users className="w-5 h-5" strokeWidth={1.5} style={{ color: '#6B4F3A' }} />
              </div>
              <h3 className="text-gray-600">สถานที่ที่ดูแล</h3>
            </div>
            <div className="text-3xl font-medium text-black">{managedLocations.length}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border"
            style={{ borderColor: '#D3D1C7' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#F1EFE8' }}>
                <TrendingDown className="w-5 h-5" strokeWidth={1.5} style={{ color: '#1D9E75' }} />
              </div>
              <h3 className="text-gray-600">สถานที่ว่าง</h3>
            </div>
            <div className="text-3xl font-medium text-black">{lowDensityLocations.length}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border"
            style={{ borderColor: '#D3D1C7' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#F1EFE8' }}>
                <TrendingUp className="w-5 h-5" strokeWidth={1.5} style={{ color: '#E24B4A' }} />
              </div>
              <h3 className="text-gray-600">สถานที่เต็ม</h3>
            </div>
            <div className="text-3xl font-medium text-black">{highDensityLocations.length}</div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-black mb-4">สถานที่ที่คุณดูแล</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {managedLocations.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <AdminLocationCard
                location={location}
                isChecked={checkedLocations.has(location.id)}
                needsCheck={checkNotification}
                onCheck={() => handleCheckLocation(location.id)}
                onUpdateCount={updateLocationCount}
                onUpdateCapacity={updateLocationCapacity}
                actualCount={location.id === '6' ? library2Count : null}
              />
            </motion.div>
          ))}
        </div>

        {/* Zone Manager for Puey Library Floor 2 - Only show if admin manages it */}
        {managedLocations.some(loc => loc.id === '6') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-white rounded-2xl p-6 shadow-lg border-2"
            style={{ borderColor: '#6B4F3A' }}
          >
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-black mb-1">จัดการที่นั่งแบบเรียลไทม์</h2>
              <p className="text-gray-600">หอสมุดป๋วยชั้น 2 - ระบบติดตามที่นั่ง 2 โซน</p>
            </div>
            <AdminZoneManager
              locationId="1"
              locationName="หอสมุดป๋วยชั้น 2"
            />
          </motion.div>
        )}

        {managedLocations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <AlertCircle className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">ยังไม่มีสถานที่ที่คุณดูแล</p>
          </div>
        )}
      </main>

      <DebugPanel />
    </div>
  );
}

interface AdminLocationCardProps {
  location: Location;
  isChecked: boolean;
  needsCheck: boolean;
  onCheck: () => void;
  onUpdateCount: (locationId: string, newCount: number) => void;
  onUpdateCapacity: (locationId: string, newCapacity: number) => void;
  actualCount?: number | null;
}

function AdminLocationCard({ location, isChecked, needsCheck, onCheck, onUpdateCount, onUpdateCapacity, actualCount }: AdminLocationCardProps) {
  const displayCount = actualCount !== null && actualCount !== undefined ? actualCount : location.currentCount;

  const [isEditing, setIsEditing] = useState(false);
  const [editCount, setEditCount] = useState(displayCount.toString());
  const [editCapacity, setEditCapacity] = useState(location.capacity.toString());
  const [saving, setSaving] = useState(false);

  // Sync local state when location changes
  useEffect(() => {
    setEditCount(displayCount.toString());
    setEditCapacity(location.capacity.toString());
  }, [displayCount, location.capacity]);

  const percentage = Math.round((displayCount / location.capacity) * 100);

  const handleSave = async () => {
    const newCount = parseInt(editCount);
    const newCapacity = parseInt(editCapacity);

    if (isNaN(newCount) || isNaN(newCapacity)) {
      toast.error('กรุณากรอกตัวเลขที่ถูกต้อง');
      return;
    }

    if (newCapacity < 1) {
      toast.error('ความจุต้องมากกว่า 0');
      return;
    }

    if (newCount < 0) {
      toast.error('จำนวนคนต้องไม่ติดลบ');
      return;
    }

    setSaving(true);

    try {
      // Update capacity first if changed
      if (newCapacity !== location.capacity) {
        await onUpdateCapacity(location.id, newCapacity);
      }

      // Then update count
      if (newCount !== location.currentCount) {
        await onUpdateCount(location.id, newCount);
      }

      toast.success('บันทึกข้อมูลสำเร็จ');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditCount(displayCount.toString());
    setEditCapacity(location.capacity.toString());
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 transition-all overflow-hidden" style={{ borderColor: '#D3D1C7' }}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-medium text-black mb-1">{location.name}</h3>
            <p className="text-sm text-gray-500">{location.category}</p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm border-2`}
            style={{
              backgroundColor: `${getDensityColor(location.currentDensity)}20`,
              borderColor: getDensityColor(location.currentDensity),
              color: getDensityColor(location.currentDensity)
            }}
          >
            {getDensityLabel(location.currentDensity)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-lg border" style={{ backgroundColor: '#F1EFE8', borderColor: '#D3D1C7' }}>
            <div className="text-sm text-gray-600 mb-1">จำนวนคนปัจจุบัน</div>
            {isEditing ? (
              <Input
                type="number"
                value={editCount}
                onChange={(e) => setEditCount(e.target.value)}
                min="0"
                max={location.capacity}
                className="text-xl h-10 mt-1 font-medium"
              />
            ) : (
              <div className="text-2xl font-medium text-black">{displayCount}</div>
            )}
          </div>
          <div className="p-3 rounded-lg border" style={{ backgroundColor: '#F1EFE8', borderColor: '#D3D1C7' }}>
            <div className="text-sm text-gray-600 mb-1">ความจุ</div>
            {isEditing ? (
              <Input
                type="number"
                value={editCapacity}
                onChange={(e) => setEditCapacity(e.target.value)}
                min="1"
                className="text-xl h-10 mt-1 font-medium"
              />
            ) : (
              <div className="text-2xl font-medium text-black">{location.capacity}</div>
            )}
          </div>
        </div>

        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-full"
            style={{ backgroundColor: getDensityColor(location.currentDensity) }}
          />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
          <span className="text-sm text-gray-500">อัปเดตเมื่อสักครู่</span>
        </div>

        {needsCheck && !isChecked && (
          <Button
            onClick={onCheck}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            <AlertCircle className="w-4 h-4 mr-2" strokeWidth={1.5} />
            ตรวจสอบสถานที่นี้
          </Button>
        )}

        {isChecked && (
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg border" style={{ backgroundColor: '#E8F5F1', color: '#1D9E75', borderColor: '#1D9E75' }}>
            <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm font-medium">ตรวจสอบแล้ว</span>
          </div>
        )}

        {!needsCheck && !isEditing && (
          <Button
            variant="outline"
            className="w-full hover:opacity-90"
            style={{ borderColor: '#6B4F3A', color: '#6B4F3A' }}
            onClick={() => setIsEditing(true)}
          >
            <Edit className="w-4 h-4 mr-2" strokeWidth={1.5} />
            แก้ไขจำนวนคน
          </Button>
        )}

        {isEditing && (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
              style={{
                backgroundColor: '#6B4F3A',
                color: '#FAF0E6',
                opacity: saving ? 0.7 : 1
              }}
            >
              <Save className="w-4 h-4 mr-2" strokeWidth={1.5} />
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={saving}
              variant="outline"
              className="flex-1 hover:opacity-90"
              style={{ borderColor: '#6B4F3A', color: '#6B4F3A' }}
            >
              <X className="w-4 h-4 mr-2" strokeWidth={1.5} />
              ยกเลิก
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
