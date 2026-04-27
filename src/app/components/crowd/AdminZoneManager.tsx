import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Armchair, UserCheck, RefreshCw, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface ZoneData {
  id: string;
  location_id: string;
  location: string; // zone name in the database
  total_seats: number;
  sitting_count: number;
  available_chairs: number;
  standing_count: number;
  updated_at: string;
}

interface AdminZoneManagerProps {
  locationId: string;
  locationName: string;
}

export function AdminZoneManager({ locationId, locationName }: AdminZoneManagerProps) {
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, { occupied: number; standing: number }>>({});

  useEffect(() => {
    fetchZones();
  }, [locationId]);

  const fetchZones = async () => {
    try {
      console.log('🟢 [AdminZoneManager] Fetching zones for all locations');

      const { data, error } = await supabase
        .from('seat_status')
        .select('*')
        .in('location_id', ['1', '2'])
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ [AdminZoneManager] Error:', error);
        toast.error('ไม่สามารถโหลดข้อมูลโซนได้');
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

        console.log('✅ [AdminZoneManager] Loaded latest zones:', uniqueZones.length);
        setZones(uniqueZones);

        // Initialize form data
        const initialFormData: Record<string, { occupied: number; standing: number }> = {};
        uniqueZones.forEach(zone => {
          initialFormData[zone.id] = {
            occupied: zone.sitting_count,
            standing: zone.standing_count
          };
        });
        setFormData(initialFormData);
      }
    } catch (err) {
      console.error('❌ [AdminZoneManager] Exception:', err);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (zoneId: string) => {
    setSaving(true);
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;

    const data = formData[zoneId];
    const occupied = Math.max(0, Math.min(zone.total_seats, data.occupied));
    const available = zone.total_seats - occupied;
    const standing = Math.max(0, data.standing);

    try {
      console.log('🔵 [AdminZoneManager] Updating zone:', { zoneId, occupied, available, standing });

      const { error } = await supabase
        .from('seat_status')
        .update({
          sitting_count: occupied,
          available_chairs: available,
          standing_count: standing,
          updated_at: new Date().toISOString()
        })
        .eq('id', zoneId);

      if (error) {
        console.error('❌ [AdminZoneManager] Error:', error);
        toast.error('ไม่สามารถบันทึกข้อมูลได้');
        return;
      }

      console.log('✅ [AdminZoneManager] Zone updated successfully');
      toast.success('บันทึกข้อมูลสำเร็จ');
      setEditingZone(null);
      await fetchZones();
    } catch (err) {
      console.error('❌ [AdminZoneManager] Exception:', err);
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (zoneId: string, field: 'occupied' | 'standing', value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      [zoneId]: {
        ...prev[zoneId],
        [field]: numValue
      }
    }));
  };

  const calculateOccupancyRate = (occupied: number, total: number) => {
    return Math.round((occupied / total) * 100);
  };

  const getOccupancyColor = (rate: number) => {
    if (rate < 40) return '#10B981';
    if (rate < 75) return '#F59E0B';
    return '#EF4444';
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#6B4F3A] border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (zones.length === 0) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">ไม่พบข้อมูลโซนสำหรับสถานที่นี้</p>
        <p className="text-sm text-gray-500 mt-2">กรุณาตรวจสอบว่ารัน migration 003_add_seat_status.sql แล้ว</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-black">{locationName}</h3>
          <p className="text-sm text-gray-600">จัดการข้อมูลโซนที่นั่ง</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchZones}
          className="flex items-center gap-2"
          style={{ borderColor: '#6B4F3A', color: '#6B4F3A' }}
        >
          <RefreshCw className="w-4 h-4" />
          รีเฟรช
        </Button>
      </div>

      {/* Zone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zones.map((zone, index) => {
          const isEditing = editingZone === zone.id;
          const currentData = formData[zone.id] || { occupied: zone.sitting_count, standing: zone.standing_count };
          const occupancyRate = calculateOccupancyRate(currentData.occupied, zone.total_seats);
          const color = getOccupancyColor(occupancyRate);

          return (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 border-2 shadow-lg"
              style={{ borderColor: isEditing ? '#6B4F3A' : '#D3D1C7' }}
            >
              {/* Zone Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: color + '20' }}>
                    <Armchair className="w-5 h-5" style={{ color }} />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-black">{zone.location}</div>
                    <div className="text-sm text-gray-500">{zone.total_seats} ที่นั่ง</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color }}>
                    {occupancyRate}%
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`occupied-${zone.id}`}>จำนวนที่นั่งมีคน</Label>
                    <Input
                      id={`occupied-${zone.id}`}
                      type="number"
                      min="0"
                      max={zone.total_seats}
                      value={currentData.occupied}
                      onChange={(e) => handleInputChange(zone.id, 'occupied', e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ที่ว่าง: {zone.total_seats - currentData.occupied} ที่
                    </p>
                  </div>

                  <div>
                    <Label htmlFor={`standing-${zone.id}`}>จำนวนคนยืน/เดิน</Label>
                    <Input
                      id={`standing-${zone.id}`}
                      type="number"
                      min="0"
                      value={currentData.standing}
                      onChange={(e) => handleInputChange(zone.id, 'standing', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleSave(zone.id)}
                      disabled={saving}
                      className="flex-1"
                      style={{ backgroundColor: '#6B4F3A', color: '#FAF9F5' }}
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          กำลังบันทึก...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          บันทึก
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingZone(null);
                        setFormData(prev => ({
                          ...prev,
                          [zone.id]: {
                            occupied: zone.sitting_count,
                            standing: zone.standing_count
                          }
                        }));
                      }}
                      disabled={saving}
                      style={{ borderColor: '#6B4F3A', color: '#6B4F3A' }}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Stats Display */}
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
                  <div className="mb-4">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${occupancyRate}%`,
                          backgroundColor: color
                        }}
                      />
                    </div>
                  </div>

                  {/* Edit Button */}
                  <Button
                    onClick={() => setEditingZone(zone.id)}
                    className="w-full"
                    variant="outline"
                    style={{ borderColor: '#6B4F3A', color: '#6B4F3A' }}
                  >
                    แก้ไขข้อมูล
                  </Button>

                  {/* Last Updated */}
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    อัพเดทล่าสุด: {new Date(zone.updated_at).toLocaleString('th-TH')}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">คำแนะนำ:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>ข้อมูลจะอัพเดทแบบเรียลไทม์ไปยังผู้ใช้ทั่วไป</li>
              <li>ที่นั่งว่างจะคำนวณอัตโนมัติ (ทั้งหมด - มีคน)</li>
              <li>สถานะความหนาแน่นจะเปลี่ยนสีตามเปอร์เซ็นต์การใช้งาน</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
