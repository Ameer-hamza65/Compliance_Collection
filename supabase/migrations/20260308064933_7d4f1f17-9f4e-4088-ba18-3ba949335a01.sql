
CREATE TABLE public.ai_query_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  enterprise_id uuid REFERENCES public.enterprises(id) ON DELETE SET NULL,
  book_id text NOT NULL,
  book_title text NOT NULL,
  chapter_id text NOT NULL,
  chapter_title text NOT NULL,
  query_type text NOT NULL,
  user_prompt text,
  ai_response text NOT NULL,
  response_time_ms integer NOT NULL,
  model_used text NOT NULL,
  tokens_used integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_query_logs ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (including unauthenticated for demo mode)
CREATE POLICY "Users can insert ai query logs"
  ON public.ai_query_logs
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Users can view their enterprise logs
CREATE POLICY "Users can view enterprise ai logs"
  ON public.ai_query_logs
  FOR SELECT
  USING (
    enterprise_id = get_user_enterprise_id(auth.uid())
    OR (enterprise_id IS NULL AND user_id = auth.uid())
    OR user_id IS NULL
  );
