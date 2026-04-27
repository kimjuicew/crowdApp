-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id TEXT NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    estimated_attendance INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_events_location_id ON public.events(location_id);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;

-- Create policies
CREATE POLICY "Events are viewable by everyone"
    ON public.events FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert events"
    ON public.events FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()::text
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update events"
    ON public.events FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()::text
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete events"
    ON public.events FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Insert sample events
INSERT INTO public.events (location_id, title, description, event_date, start_time, end_time, estimated_attendance, category) VALUES
    ('6', 'Workshop: เทคนิคการอ่านอย่างมีประสิทธิภาพ', 'เรียนรู้เทคนิคการอ่านและจดจำข้อมูลอย่างมีประสิทธิภาพสำหรับนักศึกษา', CURRENT_DATE + INTERVAL '2 days', '13:00', '15:00', 80, 'Workshop'),
    ('3', 'เทศกาลอาหาร: มหกรรมอาหารนานาชาติ', 'ชิมอาหารนานาชาติจากร้านค้าต่างๆ ภายในมหาวิทยาลัย พร้อมโปรโมชั่นพิเศษ', CURRENT_DATE + INTERVAL '3 days', '11:00', '14:00', 200, 'Food Festival'),
    ('2', 'ฟรีคลาส: Zumba Dance', 'ชั้นเรียน Zumba ฟรีสำหรับนักศึกษาและบุคลากร', CURRENT_DATE + INTERVAL '1 days', '17:00', '18:30', 45, 'Fitness Class'),
    ('6', 'การบรรยาย: การวิจัยในยุคดิจิทัล', 'บรรยายพิเศษเกี่ยวกับเครื่องมือและแนวทางการทำวิจัยในยุคดิจิทัล', CURRENT_DATE + INTERVAL '5 days', '14:00', '16:00', 120, 'Lecture'),
    ('4', 'แข่งขัน: Coding Competition', 'การแข่งขันเขียนโปรแกรมประจำปี รอบคัดเลือก', CURRENT_DATE + INTERVAL '4 days', '09:00', '17:00', 60, 'Competition'),
    ('5', 'การแข่งขันว่ายน้ำ', 'การแข่งขันว่ายน้ำระหว่างคณะ ชิงถ้วยรางวัลประจำปี', CURRENT_DATE + INTERVAL '6 days', '08:00', '12:00', 150, 'Sports Event');
