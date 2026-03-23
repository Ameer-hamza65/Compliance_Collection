-- Add platform admin SELECT policy on ai_query_logs
CREATE POLICY "Platform admins can view all ai logs"
ON public.ai_query_logs
FOR SELECT
TO authenticated
USING (is_platform_admin(auth.uid()));

-- Add ON DELETE CASCADE to book_chapters.book_id FK
ALTER TABLE public.book_chapters
DROP CONSTRAINT IF EXISTS book_chapters_book_id_fkey;

ALTER TABLE public.book_chapters
ADD CONSTRAINT book_chapters_book_id_fkey
FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;