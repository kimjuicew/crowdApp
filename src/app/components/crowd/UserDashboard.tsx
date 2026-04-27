import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Users,
  Bell,
  UserCircle,
  MapPin,
  TrendingUp,
  Clock,
  LogOut,
  BellRing,
  BellOff,
  Calendar,
} from "lucide-react";
import {
  getDensityColor,
  getDensityLabel,
  getDensityBg,
  getDensityBorder,
  type Location,
} from "../../data/mockData";
import { useLocations } from "../../context/LocationContext";
import { CategoryChips } from "./CategoryFilter";
import { Button } from "../ui/button";
import { supabase } from '../../../lib/supabase';
interface UserDashboardProps {
  userId: string;
  onLogout: () => void;
}

const locationImages: Record<string, string> = {
  "1": "/ROOM-TU.jpg",
  "2": "/TU-FITNESS.jpg",
  "3": "/TU-JC.jpg",
  "4": "/TU-COM.jpg",
  "5": "/TU-Swim.jpg",
  "6": "/ROOM-TU.jpg", // หอสมุดป๋วยชั้น 2 ใช้รูปเดียวกับชั้น 1
};

export function UserDashboard({
  userId,
  onLogout,
}: UserDashboardProps) {
  const navigate = useNavigate();
  const { locations } = useLocations();
  const [notifications, setNotifications] = useState(true);
  const [hasNewNotifications, setHasNewNotifications] =
    useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [library2Count, setLibrary2Count] = useState<number | null>(null);

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
      .channel('seat_status_dashboard')
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

  useEffect(() => {
    if (notifications) {
      const interval = setInterval(() => {
        setHasNewNotifications(Math.random() > 0.7);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [notifications]);

  const handleLocationClick = (locationId: string) => {
    navigate(`/location/${locationId}`);
  };

  const categoryMap: Record<string, string> = {
    'fitness': 'ฟิตเนส',
    'library': 'หอสมุด',
    'cafeteria': 'โรงอาหาร',
    'computer': 'ห้องคอมพิวเตอร์',
    'study': 'ห้องเรียน',
    'sport': 'ศูนย์กีฬา',
    'stadium': 'สนามกีฬา',
  };

  const filteredLocations = selectedCategory === 'all'
    ? locations.filter(loc => loc.category !== 'อาคารเรียน')
    : locations.filter(loc => {
        const categoryName = categoryMap[selectedCategory];
        return loc.category === categoryName;
      });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9F5' }}>
      <header className="bg-white border-b sticky top-0 z-10" style={{ borderColor: '#D3D1C7' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black">CrowdWatch</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1D9E75' }}></div>
                <p className="text-sm text-gray-500">Live · updated just now</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/events")}
                title="กิจกรรม"
              >
                <Calendar className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotifications(!notifications)}
                className="relative"
              >
                {notifications ? (
                  <BellRing className="w-5 h-5" />
                ) : (
                  <BellOff className="w-5 h-5" />
                )}
                {hasNewNotifications && notifications && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/profile")}
              >
                <UserCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">

        <CategoryChips
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredLocations.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <LocationCard
                location={location}
                image={locationImages[location.id]}
                onClick={() => handleLocationClick(location.id)}
                actualCount={location.id === '6' ? library2Count : null}
              />
            </motion.div>
          ))}
        </div>

        {hasNewNotifications && notifications && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 bg-white rounded-xl shadow-xl p-4 max-w-sm border-l-4"
            style={{ borderColor: '#6B4F3A' }}
          >
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 mt-0.5" style={{ color: '#6B4F3A' }} />
              <div>
                <div className="font-medium mb-1">
                  หอสมุดป๋วย อึ้งภากรณ์ เริ่มว่างแล้ว!
                </div>
                <div className="text-sm text-gray-600">
                  ตอนนี้มีคนเพียง 15 คน
                  เหมาะสำหรับการไปเรียนหนังสือ
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

interface LocationCardProps {
  location: Location;
  image: string;
  onClick: () => void;
  actualCount?: number | null;
}

function LocationCard({
  location,
  image,
  onClick,
  actualCount,
}: LocationCardProps) {
  // Use actual count from seat_status for Library Floor 2, otherwise use location.currentCount
  const displayCount = actualCount !== null && actualCount !== undefined ? actualCount : location.currentCount;
  const percentage = Math.round(
    (displayCount / location.capacity) * 100,
  );

  return (
    <motion.button
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="w-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border-2 text-left"
      style={{ borderColor: '#D3D1C7' }}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={location.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23F1EFE8" width="400" height="300"/%3E%3Ctext fill="%236B4F3A" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E' + encodeURIComponent(location.name) + '%3C/text%3E%3C/svg%3E';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        <div className="absolute top-3 right-3">
          <div
            className={`px-3 py-1 rounded-full text-sm backdrop-blur-sm border-2 ${getDensityBorder(location.currentDensity)} ${getDensityBg(location.currentDensity)}`}
            style={{
              backgroundColor: `${getDensityColor(location.currentDensity)}20`,
              borderColor: getDensityColor(
                location.currentDensity,
              ),
            }}
          >
            <span
              style={{
                color: getDensityColor(location.currentDensity),
              }}
            >
              {getDensityLabel(location.currentDensity)}
            </span>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white text-xl mb-1">
            {location.name}
          </h3>
          <p className="text-white/80 text-sm">
            {location.category}
          </p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              {displayCount} / {location.capacity} คน
            </span>
          </div>
          <div
            className="text-sm font-medium"
            style={{
              color: getDensityColor(location.currentDensity),
            }}
          >
            {percentage}%
          </div>
        </div>

        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              backgroundColor: getDensityColor(
                location.currentDensity,
              ),
            }}
          />
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>อัปเดตเมื่อสักครู่</span>
        </div>
      </div>
    </motion.button>
  );
}