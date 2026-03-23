
-- Books table with full metadata
CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  authors text[] NOT NULL DEFAULT '{}',
  publisher text,
  isbn text,
  published_year integer,
  edition text,
  cover_color text DEFAULT 'hsl(213 50% 25%)',
  cover_url text,
  file_path text,
  file_type text DEFAULT 'epub',
  description text DEFAULT '',
  specialty text DEFAULT 'Internal Medicine',
  tags text[] DEFAULT '{}',
  chapter_count integer DEFAULT 0,
  access_count integer DEFAULT 0,
  search_count integer DEFAULT 0,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Book chapters table
CREATE TABLE public.book_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  chapter_key text NOT NULL,
  title text NOT NULL,
  content text DEFAULT '',
  page_number integer DEFAULT 1,
  tags text[] DEFAULT '{}',
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- COUNTER 5.1 usage events table
CREATE TABLE public.usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  enterprise_id uuid REFERENCES public.enterprises(id),
  book_id uuid REFERENCES public.books(id),
  book_title text,
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for performance
CREATE INDEX idx_book_chapters_book_id ON public.book_chapters(book_id);
CREATE INDEX idx_usage_events_enterprise ON public.usage_events(enterprise_id, created_at);
CREATE INDEX idx_usage_events_type ON public.usage_events(event_type, created_at);
CREATE INDEX idx_books_specialty ON public.books(specialty);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- Books RLS: all authenticated users can read; admins can manage
CREATE POLICY "Anyone authenticated can view books" ON public.books
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Platform admins can manage books" ON public.books
  FOR ALL TO authenticated USING (is_platform_admin(auth.uid()));

CREATE POLICY "Enterprise admins can insert books" ON public.books
  FOR INSERT TO authenticated
  WITH CHECK (is_enterprise_admin(auth.uid()) OR is_platform_admin(auth.uid()));

CREATE POLICY "Enterprise admins can update books" ON public.books
  FOR UPDATE TO authenticated
  USING (is_enterprise_admin(auth.uid()) OR is_platform_admin(auth.uid()));

-- Book chapters RLS
CREATE POLICY "Anyone authenticated can view chapters" ON public.book_chapters
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Platform admins can manage chapters" ON public.book_chapters
  FOR ALL TO authenticated USING (is_platform_admin(auth.uid()));

CREATE POLICY "Enterprise admins can insert chapters" ON public.book_chapters
  FOR INSERT TO authenticated
  WITH CHECK (is_enterprise_admin(auth.uid()) OR is_platform_admin(auth.uid()));

-- Usage events RLS
CREATE POLICY "Users can insert usage events" ON public.usage_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Enterprise users can view usage" ON public.usage_events
  FOR SELECT TO authenticated
  USING (
    enterprise_id = get_user_enterprise_id(auth.uid())
    OR user_id = auth.uid()
    OR is_platform_admin(auth.uid())
    OR is_enterprise_admin(auth.uid())
    OR is_compliance_officer(auth.uid())
  );

-- Storage bucket for book files
INSERT INTO storage.buckets (id, name, public) VALUES ('book-files', 'book-files', false);

-- Storage RLS
CREATE POLICY "Auth users can upload book files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'book-files' AND (is_enterprise_admin(auth.uid()) OR is_platform_admin(auth.uid())));

CREATE POLICY "Auth users can read book files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'book-files');

-- Updated_at trigger for books
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for usage_events
ALTER PUBLICATION supabase_realtime ADD TABLE public.usage_events;
