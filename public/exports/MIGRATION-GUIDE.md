# Migration Guide: Lovable Cloud → Your Own Supabase

## Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **Anon Key** from Settings → API
3. Note your **Project ID** from the URL (the alphanumeric part)

## Step 2: Run the Schema SQL
1. Open **SQL Editor** in your Supabase Dashboard
2. Paste and run the **entire** contents of `SUPABASE-FULL-EXPORT.sql`
3. This creates all 20 tables, enums, 12 functions, triggers, RLS policies, and storage bucket

### What's included:
- **3 enums**: `enterprise_type`, `enterprise_role`, `platform_role` (with `rittenhouse_management`)
- **20 tables**: enterprises, enterprise_locations, profiles, platform_roles, books, book_chapters, book_access, individual_purchases, subscriptions, departments, user_department_membership, compliance_collections, collection_books, usage_events, audit_logs, ai_query_logs, bookmarks, highlights, annotations, feature_flags, quote_requests
- **12 functions**: `handle_new_user` (with domain matching + seat enforcement), `handle_new_user_role`, `assign_role`, `create_subscription`, `update_subscription`, `approve_pending_users`, `log_system_event`, and helper functions
- **4 triggers**: auto-create profile, auto-assign role, auto-update timestamps
- **Full RLS policies** on all tables

## Step 3: Deploy Edge Functions
Copy the edge function folders to your local Supabase CLI project:
```
supabase/functions/gemini-ai/index.ts
supabase/functions/parse-pdf/index.ts
supabase/functions/extract-pdf-text/index.ts
```

Deploy them:
```bash
supabase functions deploy gemini-ai --no-verify-jwt
supabase functions deploy parse-pdf --no-verify-jwt
supabase functions deploy extract-pdf-text --no-verify-jwt
```

## Step 4: Set Edge Function Secrets

### Option A: Use Lovable AI Gateway (recommended if you have a Lovable API key)
```bash
supabase secrets set LOVABLE_API_KEY=<your-lovable-api-key>
```
The `gemini-ai` edge function uses the Lovable AI Gateway by default.

### Option B: Use your own Gemini API key
```bash
supabase secrets set GEMINI_API_KEY=<your-gemini-api-key>
```
The `parse-pdf` and `extract-pdf-text` functions use `GEMINI_API_KEY` directly.

**Note:** If switching to your own AI provider, update the fetch URLs in the edge functions to point to your preferred API endpoint.

## Step 5: Update Frontend Environment
Create a `.env` file in your project root:
```
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=YOUR-PROJECT-ID
```

## Step 6: Configure Auth
In Supabase Dashboard → Authentication → Providers:
- Enable **Email** provider
- Toggle **Auto-confirm email** ON for demo, OFF for production
- Set **Site URL** to your domain
- Add redirect URLs for your domain

## Step 7: Storage
The SQL export creates the `book-files` bucket automatically. Verify it exists in Storage section.

## Step 8: Set Up First Admin
The `handle_new_user` trigger auto-matches users to enterprises by email domain:
1. Create an enterprise with a `domain` and `contact_email`
2. Sign up with the `contact_email` → auto-assigned as enterprise **admin**
3. Sign up with any email matching the `domain` → auto-assigned as **staff**
4. All new users get `platform_role = 'user'` by default

To make someone a **platform_admin**, manually insert into `platform_roles`:
```sql
INSERT INTO platform_roles (user_id, role) VALUES ('<user-uuid>', 'platform_admin');
```

## Step 9: Migrate Data (Optional)
Export your existing data from Lovable Cloud and import it:
- Use Cloud View → Database → Tables → Export for each table
- Import via Supabase Dashboard → Table Editor → Import CSV

## Architecture Notes
- All AI calls go through edge functions (not client-side)
- RLS policies use `SECURITY DEFINER` helper functions to avoid recursion
- `platform_roles` table is separate from profile roles (security best practice)
- `handle_new_user` trigger auto-matches enterprise by email domain
- Seat enforcement happens at signup (via trigger) and at subscription update (via function)
- Every new user gets `platform_role = 'user'` (change `handle_new_user_role` if you want auto-admin for demo)

## Event Types Tracked in `usage_events`
| Event Type | When Logged |
|---|---|
| `login` | User signs in |
| `search_query` | User performs a search |
| `search_result_click` | User clicks a search result |
| `title_view` | User opens a book detail page |
| `collection_view` | User visits a collection page |
| `content_view` | User opens a chapter in reader |
| `user.signup` | New user registers (via trigger) |
| `role.changed` | Admin changes a user's role |
| `subscription.created` | New subscription created |
| `subscription.updated` | Subscription seats/plan changed |
| `users.approved` | Pending users activated |
