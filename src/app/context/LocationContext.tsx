import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { calculateDensity, type Location } from '../data/mockData';
import { supabase } from '../../lib/supabase';

interface LocationContextType {
  locations: Location[];
  updateLocationCount: (locationId: string, newCount: number) => Promise<void>;
  updateLocationCapacity: (locationId: string, newCapacity: number) => Promise<void>;
  refreshLocations: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<Location[]>([]);

  // Fetch locations from Supabase on mount
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    console.log('🟢 [fetchLocations] START - Loading from Supabase...');

    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('id');

      if (error) {
        console.error('❌ [fetchLocations] Error:', error);
        return;
      }

      if (data) {
        console.log('✅ [fetchLocations] Loaded from Supabase:', data.length, 'locations');
        console.log('📊 [fetchLocations] Sample data:', data[0]);

        // Transform database fields to match Location type
        const transformedLocations: Location[] = data.map(loc => ({
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
        setLocations(transformedLocations);
        console.log('✅ [fetchLocations] State updated');
      }
    } catch (err) {
      console.error('❌ [fetchLocations] Exception:', err);
    }
  };

  const updateLocationCount = async (locationId: string, newCount: number) => {
    console.log('🔵 [updateLocationCount] START', { locationId, newCount });

    const location = locations.find(loc => loc.id === locationId);
    if (!location) {
      console.error('❌ Location not found:', locationId);
      throw new Error('Location not found');
    }

    const count = Math.max(0, Math.min(location.capacity, newCount));
    const newDensity = calculateDensity(count, location.capacity);

    console.log('🔵 [updateLocationCount] Calculated:', { count, newDensity });

    // Update in Supabase
    try {
      console.log('🔵 [updateLocationCount] Updating Supabase...');

      const { data, error } = await supabase
        .from('locations')
        .update({
          current_count: count,
          current_density: newDensity,
          updated_at: new Date().toISOString()
        })
        .eq('id', locationId)
        .select();

      if (error) {
        console.error('❌ [updateLocationCount] Supabase error:', error);
        throw error;
      }

      console.log('✅ [updateLocationCount] Supabase updated:', data);

      // Update local state
      setLocations(prev => prev.map(loc => {
        if (loc.id === locationId) {
          return {
            ...loc,
            currentCount: count,
            currentDensity: newDensity,
          };
        }
        return loc;
      }));

      console.log('✅ [updateLocationCount] Local state updated');
    } catch (err) {
      console.error('❌ [updateLocationCount] Exception:', err);
      throw err;
    }
  };

  const updateLocationCapacity = async (locationId: string, newCapacity: number) => {
    console.log('🟡 [updateLocationCapacity] START', { locationId, newCapacity });

    const location = locations.find(loc => loc.id === locationId);
    if (!location) {
      console.error('❌ Location not found:', locationId);
      throw new Error('Location not found');
    }

    const capacity = Math.max(1, newCapacity);
    const count = Math.min(location.currentCount, capacity);
    const newDensity = calculateDensity(count, capacity);

    console.log('🟡 [updateLocationCapacity] Calculated:', { capacity, count, newDensity });

    // Update in Supabase
    try {
      console.log('🟡 [updateLocationCapacity] Updating Supabase...');

      const { data, error } = await supabase
        .from('locations')
        .update({
          capacity,
          current_count: count,
          current_density: newDensity,
          updated_at: new Date().toISOString()
        })
        .eq('id', locationId)
        .select();

      if (error) {
        console.error('❌ [updateLocationCapacity] Supabase error:', error);
        throw error;
      }

      console.log('✅ [updateLocationCapacity] Supabase updated:', data);

      // Update local state
      setLocations(prev => prev.map(loc => {
        if (loc.id === locationId) {
          return {
            ...loc,
            capacity,
            currentCount: count,
            currentDensity: newDensity,
          };
        }
        return loc;
      }));

      console.log('✅ [updateLocationCapacity] Local state updated');
    } catch (err) {
      console.error('❌ [updateLocationCapacity] Exception:', err);
      throw err;
    }
  };

  const refreshLocations = async () => {
    await fetchLocations();
  };

  return (
    <LocationContext.Provider value={{ locations, updateLocationCount, updateLocationCapacity, refreshLocations }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocations() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocations must be used within a LocationProvider');
  }
  return context;
}
