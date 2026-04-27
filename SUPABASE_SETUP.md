# Supabase Setup Instructions for CrowdWatch

## 1. Database Migration

Run the SQL migration to create the database schema:

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/xqogrrdeepicusvryfud
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy and paste the contents of `/supabase/migrations/001_initial_schema.sql`
5. Click **Run** to execute the migration

This will create:
- `users` table - stores user accounts
- `locations` table - stores location data with real-time crowd information
- `user_favorites` table - stores user favorite locations
- Row Level Security (RLS) policies for data access control
- Mock data for demo users and locations

## 2. Verify Tables

After running the migration, verify the tables were created:

1. Go to **Table Editor** in the Supabase dashboard
2. You should see three tables:
   - `users` (with 3 demo users)
   - `locations` (with 6 locations)
   - `user_favorites` (empty initially)

## 3. Database Connection

The app is already configured to connect to your Supabase project:

- **Project URL**: https://xqogrrdeepicusvryfud.supabase.co
- **Anon Key**: Already configured in `src/lib/supabase.ts`

## 4. Test the Connection

1. Start the development server (if not already running)
2. Open the app and try to:
   - Login with demo credentials (user/user123 or admin/admin123)
   - Sign up for a new account
   - View locations on the dashboard

## 5. Demo Accounts

After migration, these demo accounts will be available:

**Regular User:**
- Username: `user`
- Password: `user123`

**Admin:**
- Username: `admin`
- Password: `admin123`

**Admin 2:**
- Username: `admin2`
- Password: `admin123`

## Database Schema

### Users Table
- `id` (TEXT) - Primary key
- `username` (TEXT) - Unique username
- `password` (TEXT) - Password (plain text for demo)
- `role` (TEXT) - 'user' or 'admin'
- `full_name` (TEXT) - Full name
- `email` (TEXT) - Email address
- `phone` (TEXT) - Phone number
- `notifications` (BOOLEAN) - Notification preference
- `notify_when_empty` (TEXT[]) - Array of location IDs to notify about
- `created_at` (TIMESTAMP) - Account creation time

### Locations Table
- `id` (TEXT) - Primary key
- `name` (TEXT) - Location name (Thai)
- `name_en` (TEXT) - Location name (English)
- `category` (TEXT) - Category
- `image` (TEXT) - Image identifier
- `current_density` (TEXT) - 'low', 'medium', or 'high'
- `current_count` (INTEGER) - Current number of people
- `capacity` (INTEGER) - Maximum capacity
- `latitude` (DECIMAL) - GPS latitude
- `longitude` (DECIMAL) - GPS longitude
- `hourly_data` (JSONB) - Historical hourly data
- `admin_id` (TEXT) - Assigned admin user ID
- `updated_at` (TIMESTAMP) - Last update time

### User Favorites Table
- `id` (UUID) - Primary key
- `user_id` (TEXT) - Foreign key to users table
- `location_id` (TEXT) - Foreign key to locations table
- `created_at` (TIMESTAMP) - When favorite was added

## Troubleshooting

### If login doesn't work:
1. Check browser console for errors
2. Verify the migration ran successfully in Supabase dashboard
3. Ensure the `users` table has data

### If locations don't appear:
1. Check that `locations` table has 6 rows
2. Verify the data types match the schema
3. Check browser console for fetch errors

### If you see RLS policy errors:
1. Ensure Row Level Security is enabled on all tables
2. Verify the RLS policies were created correctly
3. The current policies allow public read access for testing
