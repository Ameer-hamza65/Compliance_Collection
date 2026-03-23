
-- Add logo_color and licensing_tier to enterprises table
ALTER TABLE public.enterprises ADD COLUMN IF NOT EXISTS logo_color text DEFAULT 'hsl(213 50% 35%)';
ALTER TABLE public.enterprises ADD COLUMN IF NOT EXISTS licensing_tier text DEFAULT 'basic';

-- Create highlights table
CREATE TABLE public.highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id text NOT NULL,
  chapter_id text NOT NULL,
  text text NOT NULL,
  color text NOT NULL DEFAULT 'hsl(48 96% 70%)',
  chunk_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own highlights" ON public.highlights
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own highlights" ON public.highlights
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own highlights" ON public.highlights
  FOR DELETE USING (user_id = auth.uid());

-- Create annotations table
CREATE TABLE public.annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id text NOT NULL,
  chapter_id text NOT NULL,
  text text NOT NULL,
  note text NOT NULL,
  chunk_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own annotations" ON public.annotations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own annotations" ON public.annotations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own annotations" ON public.annotations
  FOR DELETE USING (user_id = auth.uid());

-- Create bookmarks table
CREATE TABLE public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id text NOT NULL,
  chapter_id text NOT NULL,
  chapter_title text NOT NULL,
  book_title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON public.bookmarks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks
  FOR DELETE USING (user_id = auth.uid());
