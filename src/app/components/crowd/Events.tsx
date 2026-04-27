import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Calendar, Clock, Users, MapPin, ArrowLeft, TrendingUp } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLocations } from '../../context/LocationContext';
import { Button } from '../ui/button';

interface Event {
  id: string;
  location_id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  estimated_attendance: number;
  category: string;
  created_at: string;
}

export function Events() {
  const navigate = useNavigate();
  const { locations } = useLocations();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  useEffect(() => {
    fetchEvents();
  }, [selectedLocation]);

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true });

      if (selectedLocation !== 'all') {
        query = query.eq('location_id', selectedLocation);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents(data || []);
      }
    } catch (err) {
      console.error('Exception fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    return location?.name || 'ไม่ระบุสถานที่';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance < 50) return '#10B981';
    if (attendance < 100) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9F5' }}>
      {/* Header */}
      <header className="text-white border-b" style={{ backgroundColor: '#6B4F3A', borderColor: '#5C3D2E' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">กิจกรรมและอีเวนต์</h1>
              <p className="text-white/80 mt-1">ติดตามกิจกรรมต่างๆ ในแต่ละสถานที่</p>
            </div>
          </div>

          {/* Location Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedLocation('all')}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedLocation === 'all'
                  ? 'bg-white text-[#6B4F3A]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              ทั้งหมด
            </button>
            {locations.map(location => (
              <button
                key={location.id}
                onClick={() => setSelectedLocation(location.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedLocation === location.id
                    ? 'bg-white text-[#6B4F3A]'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {location.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-[#6B4F3A] border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดกิจกรรม...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">ไม่มีกิจกรรมที่กำลังจะมาถึง</p>
            <p className="text-gray-500 text-sm mt-2">กลับมาตรวจสอบใหม่ในภายหลัง</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border-2 hover:shadow-lg transition-shadow cursor-pointer"
                style={{ borderColor: '#D3D1C7' }}
                onClick={() => navigate(`/location/${event.location_id}`)}
              >
                {/* Event Category Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: '#F1EFE8',
                      color: '#6B4F3A'
                    }}
                  >
                    {event.category}
                  </span>
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                </div>

                {/* Event Title */}
                <h3 className="text-lg font-bold text-black mb-2 line-clamp-2">
                  {event.title}
                </h3>

                {/* Event Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {event.description}
                </p>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" style={{ color: '#6B4F3A' }} />
                  <span>{getLocationName(event.location_id)}</span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" style={{ color: '#6B4F3A' }} />
                  <span>{formatDate(event.event_date)}</span>
                </div>

                {/* Time */}
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                  <Clock className="w-4 h-4" style={{ color: '#6B4F3A' }} />
                  <span>
                    {formatTime(event.start_time)} - {formatTime(event.end_time)} น.
                  </span>
                </div>

                {/* Estimated Attendance */}
                <div
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: '#F1EFE8' }}
                >
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>ประมาณการผู้เข้าร่วม</span>
                  </div>
                  <div
                    className="text-lg font-bold"
                    style={{ color: getAttendanceColor(event.estimated_attendance) }}
                  >
                    ~{event.estimated_attendance} คน
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
