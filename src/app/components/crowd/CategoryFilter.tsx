import { motion } from 'motion/react';
import {
  Dumbbell,
  BookOpen,
  Monitor,
  Library,
  Utensils,
  Trophy,
  Activity
} from 'lucide-react';

export const categories = [
  { id: 'all', name: 'ทั้งหมด', nameEn: 'All', icon: null },
  { id: 'fitness', name: 'ฟิตเนส', nameEn: 'Fitness', icon: Dumbbell },
  { id: 'library', name: 'หอสมุด', nameEn: 'Library', icon: Library },
  { id: 'cafeteria', name: 'โรงอาหาร', nameEn: 'Cafeteria', icon: Utensils },
  { id: 'computer', name: 'ห้องคอมพิวเตอร์', nameEn: 'Computer Lab', icon: Monitor },
  { id: 'study', name: 'ห้องเรียน', nameEn: 'Study Area', icon: BookOpen },
  { id: 'sport', name: 'ศูนย์กีฬา', nameEn: 'Sports Center', icon: Activity },
  { id: 'stadium', name: 'สนามกีฬา', nameEn: 'Stadium', icon: Trophy },
];

interface CategoryChipsProps {
  selectedCategory?: string;
  onSelectCategory?: (categoryId: string) => void;
}

export function CategoryChips({ selectedCategory = 'all', onSelectCategory }: CategoryChipsProps) {
  return (
    <div className="mb-6">
      <div className="overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-2.5 min-w-max">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;

            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectCategory?.(category.id)}
                style={{
                  backgroundColor: isSelected ? '#6B4F3A' : 'white',
                  borderColor: isSelected ? '#6B4F3A' : '#D3D1C7',
                  color: isSelected ? '#FAF0E6' : '#374151'
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all hover:opacity-90"
              >
                {Icon && !isSelected && (
                  <Icon
                    className="w-4 h-4"
                    strokeWidth={1.5}
                    style={{ color: '#6B4F3A' }}
                  />
                )}
                <span className="text-sm font-medium whitespace-nowrap">
                  {category.nameEn}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}