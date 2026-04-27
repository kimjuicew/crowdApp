export type CrowdLevel = 'low' | 'medium' | 'high';
export type UserRole = 'user' | 'admin';

export interface Location {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  image: string;
  currentDensity: CrowdLevel;
  currentCount: number;
  capacity: number;
  latitude: number;
  longitude: number;
  hourlyData: {
    hour: number;
    count: number;
    density: CrowdLevel;
  }[];
  adminId?: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone: string;
  notifications: boolean;
  notifyWhenEmpty: string[]; // location IDs
}

export interface Notification {
  id: string;
  userId: string;
  locationId: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'density_change' | 'admin_check' | 'suggestion';
}

// Mock locations data
export const mockLocations: Location[] = [
  {
    id: '1',
    name: 'หอสมุดป๋วย อึ้งภากรณ์',
    nameEn: 'Puey Ungphakorn Library, Thammasat University',
    category: 'หอสมุด',
    image: 'library',
    currentDensity: 'low',
    currentCount: 15,
    capacity: 120,
    latitude: 13.7563,
    longitude: 100.5018,
    hourlyData: [
      { hour: 8, count: 10, density: 'low' },
      { hour: 9, count: 25, density: 'low' },
      { hour: 10, count: 45, density: 'medium' },
      { hour: 11, count: 65, density: 'medium' },
      { hour: 12, count: 90, density: 'high' },
      { hour: 13, count: 95, density: 'high' },
      { hour: 14, count: 80, density: 'high' },
      { hour: 15, count: 70, density: 'medium' },
      { hour: 16, count: 55, density: 'medium' },
      { hour: 17, count: 40, density: 'medium' },
      { hour: 18, count: 25, density: 'low' },
      { hour: 19, count: 15, density: 'low' },
      { hour: 20, count: 20, density: 'low' },
    ],
    adminId: 'admin1',
  },
  {
    id: '2',
    name: 'TU ฟิตเนส',
    nameEn: 'TU Fitness',
    category: 'ฟิตเนส',
    image: 'gym',
    currentDensity: 'high',
    currentCount: 75,
    capacity: 80,
    latitude: 13.7565,
    longitude: 100.5025,
    hourlyData: [
      { hour: 6, count: 45, density: 'medium' },
      { hour: 7, count: 70, density: 'high' },
      { hour: 8, count: 75, density: 'high' },
      { hour: 9, count: 65, density: 'high' },
      { hour: 10, count: 50, density: 'medium' },
      { hour: 11, count: 35, density: 'medium' },
      { hour: 12, count: 25, density: 'low' },
      { hour: 13, count: 20, density: 'low' },
      { hour: 14, count: 30, density: 'medium' },
      { hour: 15, count: 40, density: 'medium' },
      { hour: 16, count: 50, density: 'medium' },
      { hour: 17, count: 70, density: 'high' },
      { hour: 18, count: 78, density: 'high' },
      { hour: 19, count: 60, density: 'high' },
      { hour: 20, count: 45, density: 'medium' },
    ],
    adminId: 'admin1',
  },
  {
    id: '3',
    name: 'โรงอาหาร JC',
    nameEn: 'JC Cafeteria',
    category: 'โรงอาหาร',
    image: 'cafeteria',
    currentDensity: 'medium',
    currentCount: 140,
    capacity: 250,
    latitude: 13.7560,
    longitude: 100.5015,
    hourlyData: [
      { hour: 7, count: 30, density: 'low' },
      { hour: 8, count: 60, density: 'low' },
      { hour: 9, count: 80, density: 'medium' },
      { hour: 10, count: 70, density: 'medium' },
      { hour: 11, count: 150, density: 'medium' },
      { hour: 12, count: 230, density: 'high' },
      { hour: 13, count: 220, density: 'high' },
      { hour: 14, count: 140, density: 'medium' },
      { hour: 15, count: 90, density: 'medium' },
      { hour: 16, count: 100, density: 'medium' },
      { hour: 17, count: 180, density: 'high' },
      { hour: 18, count: 200, density: 'high' },
      { hour: 19, count: 120, density: 'medium' },
      { hour: 20, count: 60, density: 'low' },
    ],
    adminId: 'admin2',
  },
  {
    id: '4',
    name: 'ห้องคอมคณะวิศวะ ชั้น 2',
    nameEn: 'Engineering Computer Lab Floor 2',
    category: 'ห้องคอมพิวเตอร์',
    image: 'computer',
    currentDensity: 'low',
    currentCount: 20,
    capacity: 100,
    latitude: 13.7568,
    longitude: 100.5020,
    hourlyData: [
      { hour: 8, count: 15, density: 'low' },
      { hour: 9, count: 30, density: 'low' },
      { hour: 10, count: 50, density: 'medium' },
      { hour: 11, count: 60, density: 'medium' },
      { hour: 12, count: 45, density: 'medium' },
      { hour: 13, count: 55, density: 'medium' },
      { hour: 14, count: 70, density: 'high' },
      { hour: 15, count: 65, density: 'medium' },
      { hour: 16, count: 50, density: 'medium' },
      { hour: 17, count: 35, density: 'low' },
      { hour: 18, count: 25, density: 'low' },
      { hour: 19, count: 20, density: 'low' },
      { hour: 20, count: 15, density: 'low' },
    ],
    adminId: 'admin2',
  },
  {
    id: '5',
    name: 'สระว่ายน้ำ',
    nameEn: 'Swimming Pool',
    category: 'ศูนย์กีฬา',
    image: 'pool',
    currentDensity: 'medium',
    currentCount: 30,
    capacity: 50,
    latitude: 13.7555,
    longitude: 100.5012,
    hourlyData: [
      { hour: 6, count: 20, density: 'medium' },
      { hour: 7, count: 25, density: 'medium' },
      { hour: 8, count: 30, density: 'medium' },
      { hour: 9, count: 35, density: 'high' },
      { hour: 10, count: 40, density: 'high' },
      { hour: 11, count: 35, density: 'high' },
      { hour: 12, count: 25, density: 'medium' },
      { hour: 13, count: 20, density: 'medium' },
      { hour: 14, count: 30, density: 'medium' },
      { hour: 15, count: 35, density: 'high' },
      { hour: 16, count: 45, density: 'high' },
      { hour: 17, count: 40, density: 'high' },
      { hour: 18, count: 30, density: 'medium' },
      { hour: 19, count: 20, density: 'medium' },
    ],
    adminId: 'admin1',
  },
  {
    id: '6',
    name: 'หอสมุดป๋วยชั้น 2',
    nameEn: 'Puey Ungphakorn Library Floor 2',
    category: 'หอสมุด',
    image: 'library',
    currentDensity: 'low',
    currentCount: 25,
    capacity: 100,
    latitude: 13.7563,
    longitude: 100.5018,
    hourlyData: [
      { hour: 8, count: 15, density: 'low' },
      { hour: 9, count: 30, density: 'low' },
      { hour: 10, count: 50, density: 'medium' },
      { hour: 11, count: 70, density: 'high' },
      { hour: 12, count: 85, density: 'high' },
      { hour: 13, count: 80, density: 'high' },
      { hour: 14, count: 65, density: 'medium' },
      { hour: 15, count: 55, density: 'medium' },
      { hour: 16, count: 45, density: 'medium' },
      { hour: 17, count: 35, density: 'low' },
      { hour: 18, count: 20, density: 'low' },
      { hour: 19, count: 15, density: 'low' },
      { hour: 20, count: 25, density: 'low' },
    ],
    adminId: 'admin1',
  },
];

// Mock users
export const mockUsers: User[] = [
  {
    id: 'user1',
    username: 'user',
    password: 'user123',
    role: 'user',
    fullName: 'สมชาย ใจดี',
    email: 'somchai@example.com',
    phone: '081-234-5678',
    notifications: true,
    notifyWhenEmpty: ['1', '2'],
  },
  {
    id: 'admin1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    fullName: 'ผู้ดูแลระบบ ห้องสมุด',
    email: 'admin@example.com',
    phone: '082-345-6789',
    notifications: true,
    notifyWhenEmpty: [],
  },
  {
    id: 'admin2',
    username: 'admin2',
    password: 'admin123',
    role: 'admin',
    fullName: 'ผู้ดูแลระบบ โรงอาหาร',
    email: 'admin2@example.com',
    phone: '083-456-7890',
    notifications: true,
    notifyWhenEmpty: [],
  },
];

export const getDensityColor = (density: CrowdLevel): string => {
  switch (density) {
    case 'low':
      return '#1D9E75'; // status/available
    case 'medium':
      return '#EF9F27'; // status/busy
    case 'high':
      return '#E24B4A'; // status/full
  }
};

export const getDensityLabel = (density: CrowdLevel): string => {
  switch (density) {
    case 'low':
      return 'ว่าง';
    case 'medium':
      return 'ปานกลาง';
    case 'high':
      return 'แน่น';
  }
};

export const getDensityBg = (density: CrowdLevel): string => {
  switch (density) {
    case 'low':
      return 'bg-emerald-50';
    case 'medium':
      return 'bg-orange-50';
    case 'high':
      return 'bg-red-50';
  }
};

export const getDensityBorder = (density: CrowdLevel): string => {
  switch (density) {
    case 'low':
      return 'border-emerald-500';
    case 'medium':
      return 'border-orange-500';
    case 'high':
      return 'border-red-500';
  }
};

export const getDensityText = (density: CrowdLevel): string => {
  switch (density) {
    case 'low':
      return 'text-emerald-700';
    case 'medium':
      return 'text-orange-700';
    case 'high':
      return 'text-red-700';
  }
};

// Calculate density based on count and capacity
export const calculateDensity = (count: number, capacity: number): CrowdLevel => {
  const percentage = (count / capacity) * 100;
  if (percentage < 40) return 'low';
  if (percentage < 75) return 'medium';
  return 'high';
};

// Find similar locations based on category
export const findSimilarLocations = (locationId: string): Location[] => {
  const location = mockLocations.find(loc => loc.id === locationId);
  if (!location) return [];

  return mockLocations
    .filter(loc =>
      loc.id !== locationId &&
      loc.category === location.category &&
      loc.currentDensity === 'low'
    )
    .slice(0, 3);
};