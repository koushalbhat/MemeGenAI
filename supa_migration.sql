-- 1) Create the user_id column safely mapping to Supabase's native auth table
ALTER TABLE meme_history
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2) (Optional but Recommended) Enable Row Level Security (RLS) on Meme History 
-- This guarantees a user can ONLY physically retrieve/delete their own history
ALTER TABLE meme_history ENABLE ROW LEVEL SECURITY;

-- 3) Create RLS access policies
CREATE POLICY "Users can insert their own memes"
ON meme_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own memes"
ON meme_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4) Storage Integrity Access 
-- Allows the FastAPI anon-key backend to push physical image bytes into the cloud
CREATE POLICY "Allow programmatic backend uploads" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'memes');
