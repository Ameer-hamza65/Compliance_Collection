
-- Add sensible defaults to nullable columns across tables

-- books defaults (some already set from prior migration, ensure all)
ALTER TABLE public.books ALTER COLUMN description SET DEFAULT '';
ALTER TABLE public.books ALTER COLUMN specialty SET DEFAULT 'Internal Medicine';
ALTER TABLE public.books ALTER COLUMN publisher SET DEFAULT '';
ALTER TABLE public.books ALTER COLUMN isbn SET DEFAULT '';
ALTER TABLE public.books ALTER COLUMN cover_color SET DEFAULT 'hsl(213 50% 25%)';
ALTER TABLE public.books ALTER COLUMN chapter_count SET DEFAULT 0;
ALTER TABLE public.books ALTER COLUMN access_count SET DEFAULT 0;
ALTER TABLE public.books ALTER COLUMN search_count SET DEFAULT 0;
ALTER TABLE public.books ALTER COLUMN tags SET DEFAULT '{}';
ALTER TABLE public.books ALTER COLUMN file_type SET DEFAULT 'epub';

-- profiles default
ALTER TABLE public.profiles ALTER COLUMN full_name SET DEFAULT 'Unknown User';

-- enterprises defaults
ALTER TABLE public.enterprises ALTER COLUMN licensing_tier SET DEFAULT 'basic';
ALTER TABLE public.enterprises ALTER COLUMN logo_color SET DEFAULT 'hsl(213 50% 35%)';

-- usage_events: change book_id from uuid to text to support mock string IDs
ALTER TABLE public.usage_events DROP CONSTRAINT IF EXISTS usage_events_book_id_fkey;
ALTER TABLE public.usage_events ALTER COLUMN book_id TYPE text USING book_id::text;

-- usage_events: default metadata to empty object
ALTER TABLE public.usage_events ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;
