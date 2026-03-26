# 🚀 MedCompli — Local Setup & Supabase Migration Guide
# Updated: 2026-03-23

## Step 1: Pull Code from GitHub

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME
```

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Create Your Own Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Pick a name, set a database password, choose a region
3. Wait for the project to finish setting up (~2 minutes)

---

## Step 4: Run the Database Schema

1. In your Supabase Dashboard → **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the file `public/exports/SUPABASE-FULL-EXPORT.sql` from your project
4. Copy-paste the **entire contents** into the SQL Editor
5. Click **Run** ✅

This creates all tables, enums, security policies, functions, triggers, and the storage bucket automatically.

> **Note:** The SQL export is kept in sync with the live database schema. If you encounter any issues, check the `public/exports/MIGRATION-GUIDE.md` for detailed architecture notes.

---

## Step 5: Enable Email Auth

1. In Supabase Dashboard → **Authentication** (left sidebar)
2. Go to **Providers** tab
3. Make sure **Email** is enabled
4. For demo/testing: Toggle **"Confirm email"** OFF (so you can sign up without email verification)
5. For production: Keep it ON
6. Set **Site URL** to your domain (e.g. `http://localhost:8080` for local dev)
7. Add redirect URLs: `http://localhost:8080`, `http://localhost:8080/reset-password`

---

## Step 6: Get Your Supabase Credentials

1. In Supabase Dashboard → **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like `https://abcdefg.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
3. Also note your **Project ID** from the URL (the `abcdefg` part)

---

## Step 7: Update Your `.env` File

Create or edit the `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key-here
VITE_SUPABASE_PROJECT_ID=YOUR-PROJECT-ID
```

Replace the values with what you copied in Step 6.

---

## Step 8: Deploy Edge Functions (AI Features)

### Install Supabase CLI

```bash
npm install -g supabase
```

### Login to Supabase

```bash
supabase login
```

### Link Your Project

```bash
supabase link --project-ref YOUR-PROJECT-ID
```

### Deploy the Functions

```bash
supabase functions deploy gemini-ai --no-verify-jwt
supabase functions deploy parse-pdf --no-verify-jwt
supabase functions deploy extract-pdf-text --no-verify-jwt
```

### Set Your API Keys

The platform uses multiple AI providers. Set each secret:

#### Groq API Key (AI Search)
The AI-powered search feature uses Groq (Llama 3.3 70B). Get your free API key from [console.groq.com](https://console.groq.com/keys):

```bash
supabase secrets set GROQ_API_KEY=your-groq-api-key-here
```

#### Google Gemini API Key (PDF Parsing)
The PDF upload and text extraction features use Google Gemini. Get your API key from [Google AI Studio](https://aistudio.google.com/apikeys):

```bash
supabase secrets set GEMINI_API_KEY=your-gemini-api-key-here
```

#### Lovable API Key (Optional — AI Gateway)
If you have a Lovable API key for the AI gateway:

```bash
supabase secrets set LOVABLE_API_KEY=your-lovable-api-key-here
```

> **Which function uses what:**
> | Edge Function | API Key Used | Purpose |
> |---|---|---|
> | `gemini-ai` | `GROQ_API_KEY` (or `LOVABLE_API_KEY`) | AI search, chapter summaries |
> | `parse-pdf` | `GEMINI_API_KEY` | PDF chapter extraction |
> | `extract-pdf-text` | `GEMINI_API_KEY` | PDF text extraction |

---

## Step 9: Create the Storage Bucket

1. In Supabase Dashboard → **Storage** (left sidebar)
2. Click **New Bucket**
3. Name it exactly: `book-files`
4. Keep it as **Private** (not public)
5. Click **Create**

> The SQL export tries to create this automatically, but if it already exists or was skipped, create it manually here.

---

## Step 10: Set Up First Admin

The `handle_new_user` trigger auto-matches users to enterprises by email domain:

1. **Create an enterprise** in the `enterprises` table with a `domain` (e.g. `hospital.org`) and `contact_email`
2. **Sign up with the `contact_email`** → auto-assigned as enterprise **admin**
3. **Sign up with any email matching the `domain`** → auto-assigned as **staff**
4. All new users get `platform_role = 'user'` by default

To make someone a **platform_admin** (super admin), manually insert into `platform_roles`:

```sql
INSERT INTO platform_roles (user_id, role) VALUES ('<user-uuid>', 'platform_admin');
```

---

## Step 11: Run the App! 🎉

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## ✅ Quick Checklist

| Step | Done? |
|------|-------|
| Cloned repo | ☐ |
| Ran `npm install` | ☐ |
| Created Supabase project | ☐ |
| Ran SQL schema | ☐ |
| Enabled Email auth | ☐ |
| Set Site URL & redirect URLs | ☐ |
| Updated `.env` with credentials | ☐ |
| Deployed edge functions | ☐ |
| Set `GROQ_API_KEY` secret | ☐ |
| Set `GEMINI_API_KEY` secret | ☐ |
| Set `LOVABLE_API_KEY` secret (optional) | ☐ |
| Created `book-files` storage bucket | ☐ |
| Created first enterprise + admin user | ☐ |
| Ran `npm run dev` | ☐ |

---

## 🆘 Troubleshooting

**"Invalid API key" error in browser console**
→ Double-check your `.env` values match what's in Supabase Dashboard → Settings → API

**Sign-up not working**
→ Make sure Email provider is enabled in Authentication → Providers

**User signs up but can't access anything**
→ Check if the user's email domain matches an enterprise `domain`. If no match, the user gets `enterprise_id = NULL` and won't see enterprise-scoped data.

**AI features not working**
→ Make sure edge functions are deployed and the `GEMINI_API_KEY` secret is set

**Storage upload fails**
→ Verify the `book-files` bucket exists in Storage

**Port 8080 already in use**
→ The app defaults to port 8080. Kill any other process using it, or change the port in `vite.config.ts`

**"seat_limit_exceeded" on signup**
→ The enterprise has reached its `license_seats` limit. Increase seats or have an admin approve pending users from the Enterprise Dashboard.
