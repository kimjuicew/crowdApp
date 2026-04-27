-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    admin_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_admin_id ON public.messages(admin_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages(read);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can send messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can update messages" ON public.messages;

-- Create policies
CREATE POLICY "Users can view their own messages"
    ON public.messages FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()::text
        OR (
            is_admin = true
            AND EXISTS (
                SELECT 1 FROM public.users
                WHERE id = auth.uid()::text
                AND role = 'admin'
            )
        )
    );

CREATE POLICY "Users can send messages"
    ON public.messages FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()::text
        AND is_admin = false
    );

CREATE POLICY "Admins can view all messages"
    ON public.messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()::text
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can send messages"
    ON public.messages FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()::text
            AND role = 'admin'
        )
        AND is_admin = true
    );

CREATE POLICY "Admins can update messages"
    ON public.messages FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()::text
            AND role = 'admin'
        )
    );
