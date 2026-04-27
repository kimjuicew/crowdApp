import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xqogrrdeepicusvryfud.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxb2dycmRlZXBpY3VzdnJ5ZnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NjYwNzIsImV4cCI6MjA5MTU0MjA3Mn0.2xl8graz0jfXG1pTsRQezQxfPmhgYAlhuTejdwGwHgw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          password: string;
          role: 'user' | 'admin';
          full_name: string;
          email: string;
          phone: string;
          notifications: boolean;
          notify_when_empty: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      locations: {
        Row: {
          id: string;
          name: string;
          name_en: string;
          category: string;
          image: string;
          current_density: 'low' | 'medium' | 'high';
          current_count: number;
          capacity: number;
          latitude: number;
          longitude: number;
          hourly_data: any;
          admin_id: string | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['locations']['Row'], 'updated_at'>;
        Update: Partial<Database['public']['Tables']['locations']['Insert']>;
      };
      user_favorites: {
        Row: {
          id: string;
          user_id: string;
          location_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_favorites']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['user_favorites']['Insert']>;
      };
      seat_status: {
        Row: {
          id: string;
          location_id: string;
          location: string;
          total_seats: number;
          sitting_count: number;
          available_chairs: number;
          standing_count: number;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['seat_status']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['seat_status']['Insert']>;
      };
      events: {
        Row: {
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
        };
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['events']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          user_id: string;
          message: string;
          is_admin: boolean;
          admin_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
    };
  };
}
