-- Create community_messages table
CREATE TABLE IF NOT EXISTS public.community_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    message TEXT NOT NULL CHECK (char_length(message) <= 500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON public.community_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_messages_user_id ON public.community_messages(user_id);

-- Enable Row Level Security
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read messages
CREATE POLICY "Anyone can read community messages"
ON public.community_messages
FOR SELECT
USING (true);

-- Policy: Authenticated users can insert their own messages
CREATE POLICY "Authenticated users can insert messages"
ON public.community_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
ON public.community_messages
FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
