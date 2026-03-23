# Sarasota Demo Report: Compliance Collections AI

**Project:** Compliance Collections AI — Institutional SaaS Platform  
**Prepared For:** Rittenhouse Stakeholder Demo (Sarasota, FL)  
**Date:** March 2026  
**Status:** ✅ Demo-Ready

---

## Executive Summary

Compliance Collections AI is a purpose-built, AI-powered institutional SaaS platform for hospitals and surgery centers. It delivers curated compliance content (policies, procedures, and clinical guidelines) through a secure, multi-tenant architecture with tiered licensing, automated content ingestion, AI-assisted chapter analysis, and COUNTER 5.1 librarian reporting.

This report documents the six core demo pillars requested by stakeholders and maps each to the implemented functionality.

---

## Demo Pillar 1: Repository Architecture

**Route:** `/admin/repository`  
**Question answered:** *Where and how are EPUB3 and PDF files stored?*

### What to Show

- **Storage bucket:** `book-files` — private, RLS-protected bucket for all uploaded EPUB and PDF content
- **Metadata tables:** `books` table stores structured metadata; `book_chapters` stores chapter-level content
- **Architecture diagram:** Visual cards on the Repository Overview page show the relationship between Storage → Metadata → Access Control → Catalog

### Database Tables

| Table | Purpose |
|-------|---------|
| `books` | Title, authors, publisher, ISBN, edition, year, specialty, tags, file_path, file_type |
| `book_chapters` | Chapter content, tags, page numbers, sort order — linked to `books` via `book_id` |
| Storage: `book-files` | Raw EPUB/PDF binary files with RLS-restricted access |

### 📸 Screenshots to Capture

1. **Screenshot 1:** Repository Overview page (`/admin/repository`) — showing architecture cards (Storage, Metadata, Access Control) and the books table listing
2. **Screenshot 2:** Storage bucket file listing section on the same page — showing uploaded files with file types

---

## Demo Pillar 2: Security & Access Control

**Routes:** `/collections`, `/collections/:id`, `/enterprise`  
**Question answered:** *How does institutional access control protect content?*

### What to Show

- **Row-Level Security (RLS):** Every table has RLS policies — data is isolated per enterprise
- **Tier-gated collections:** Basic tier sees 2/5 collections unlocked; Pro/Enterprise see all 5
- **Seat enforcement:** Dashboard shows seat utilization with warning/critical banners
- **Role-based access:** Four roles — `admin`, `compliance_officer`, `department_manager`, `staff`
- **Book-level entitlements:** `book_access` table controls which enterprise can access which titles

### Database Tables

| Table | Purpose |
|-------|---------|
| `enterprises` | Tenant record with `license_seats`, `used_seats`, `type` |
| `profiles` | User profiles with `role` and `enterprise_id` |
| `book_access` | Per-enterprise, per-book access grants with expiry dates |
| `platform_roles` | Platform-level admin designation |

### Tier Enforcement Matrix

| Feature | Basic | Pro | Enterprise |
|---------|-------|-----|-----------|
| Seats | 10 | 25 | 250+ |
| Collections | 2/5 | 5/5 | 5/5 + custom |
| AI queries/mo | 100 | 500 | Unlimited |
| Add-on builder | ❌ | ✅ | ✅ |
| Multi-location | ❌ | ❌ | ✅ |
| COUNTER reports | Basic | Enhanced | Full |

### 📸 Screenshots to Capture

3. **Screenshot 3:** Collections page logged in as **Basic tier** (Community Health Clinic) — showing 2 unlocked + 3 locked collections with "Pro Required" badges
4. **Screenshot 4:** Collections page logged in as **Pro tier** (Bayview Surgical Center) — showing all 5 collections unlocked
5. **Screenshot 5:** Enterprise Dashboard (`/enterprise`) — showing seat utilization bar, current plan card, and collection usage stats

---

## Demo Pillar 3: Metadata Structure

**Route:** `/admin/repository`  
**Question answered:** *What metadata is stored for each title?*

### What to Show

- The books table on the Repository Overview page displays: Title, Authors, Publisher, ISBN, Edition, Published Year, Specialty, File Type, Chapter Count
- Tags are stored as arrays for search and AI context
- Each chapter has its own tags for compliance topic classification

### Metadata Fields (books table)

| Field | Type | Example |
|-------|------|---------|
| `title` | text | "Morgan & Mikhail's Clinical Anesthesiology" |
| `authors` | text[] | ["Butterworth", "Mackey", "Wasnick"] |
| `publisher` | text | "McGraw-Hill Education" |
| `isbn` | text | "978-1-260-47379-7" |
| `edition` | text | "7th Edition" |
| `published_year` | integer | 2022 |
| `specialty` | text | "Anesthesia" |
| `tags` | text[] | ["anesthesia", "perioperative", "patient_safety"] |
| `description` | text | Full description for catalog display |
| `file_type` | text | "epub" or "pdf" |
| `cover_color` | text | HSL color for visual card |

### 📸 Screenshots to Capture

6. **Screenshot 6:** Repository Overview books table — showing metadata columns (Title, Authors, Publisher, ISBN, Edition, Year, Specialty, Type, Chapters)
7. **Screenshot 7:** Backend database view of `books` table — showing raw data rows

---

## Demo Pillar 4: Automation Workflow (Ingestion Pipeline)

**Route:** `/admin/upload`  
**Question answered:** *How is content ingested and how is metadata applied?*

### What to Show

The multi-step upload wizard:

1. **Step 1 — File Upload:** Drag-and-drop EPUB or PDF file
2. **Step 2 — AI Extraction:** System automatically extracts metadata using Gemini AI:
   - Title, authors, publisher, ISBN, edition, year
   - Chapter structure with titles and page numbers
   - Medical specialty and compliance tags
   - Description/summary
3. **Step 3 — Review & Edit:** Admin reviews AI-extracted metadata, adjusts if needed
4. **Step 4 — Tag Assignment:** Medical tags are auto-detected and can be refined
5. **Step 5 — Publish:** Book + chapters saved to database; file stored in `book-files` bucket

### Technical Pipeline

```
Upload → Edge Function (parse-pdf) → Gemini AI extraction → 
Metadata review → Save to books table → Save chapters to book_chapters → 
Store file in book-files bucket → Available in catalog
```

### Fallback Handling

If AI extraction fails, the system gracefully falls back to manual metadata entry — ensuring no upload is blocked.

### 📸 Screenshots to Capture

8. **Screenshot 8:** Admin Upload page — Step 1 (file drop zone)
9. **Screenshot 9:** Admin Upload page — Step 2 (AI extracting metadata, showing spinner/progress)
10. **Screenshot 10:** Admin Upload page — Step 3 (AI-populated metadata fields: title, authors, publisher, ISBN)
11. **Screenshot 11:** Admin Upload page — Step 4 (auto-detected medical tags)

---

## Demo Pillar 5: Catalog & Search

**Routes:** `/library`, `/reader`  
**Question answered:** *How do titles appear and how does search work?*

### What to Show

- **Library catalog:** Grid of book cards showing cover, title, authors, specialty badge
- **Search:** Real-time search across titles, authors, and tags with weighted scoring:
  - Title match: 30 points
  - Tag match: 20 points
  - Content keyword: 5 points per occurrence
- **Reader:** Full chapter reader with table of contents, AI panel for chapter-scoped Q&A
- **AI panel features:** Chapter summary, key compliance points, free-form Q&A — all restricted to internal content only

### AI Guardrails

- AI searches internal repository only — no open-web queries
- All AI queries logged to `ai_query_logs` with user, enterprise, book, chapter context
- Responses cite repository titles only
- Query caps enforced per tier

### 📸 Screenshots to Capture

12. **Screenshot 12:** Library page (`/library`) — showing book grid with specialty badges
13. **Screenshot 13:** Library page — search results for a compliance term (e.g., "infection control")
14. **Screenshot 14:** Reader page (`/reader`) — showing chapter content with AI panel open
15. **Screenshot 15:** AI panel — showing a chapter summary or Q&A response with "Internal sources only" indicator

---

## Demo Pillar 6: Usage & Reporting (COUNTER 5.1)

**Routes:** `/counter-reports`, `/enterprise`, `/audit-logs`  
**Question answered:** *What reporting is available for librarians?*

### What to Show

- **COUNTER 5.1 reports:** TR_B1 (Book Master Report by Title) and TR_B3 (Book Usage by Month)
- **CSV export:** One-click download for librarian integration with existing systems
- **Enterprise Dashboard:** Seat usage, collection usage, title usage, AI query count
- **Audit logs:** Every user action tracked — book access, AI queries, login events, collection views

### Database Tables for Reporting

| Table | Report Use |
|-------|-----------|
| `usage_events` | COUNTER metrics — searches, item_requests, access_denied events |
| `ai_query_logs` | AI usage reporting — queries per user/enterprise/month |
| `audit_logs` | Governance — action trail with timestamps, IPs, targets |

### 📸 Screenshots to Capture

16. **Screenshot 16:** COUNTER Reports page (`/counter-reports`) — showing TR_B1 report table
17. **Screenshot 17:** COUNTER Reports page — showing TR_B3 monthly breakdown
18. **Screenshot 18:** CSV export button / downloaded file preview
19. **Screenshot 19:** Enterprise Dashboard (`/enterprise`) — usage stats cards
20. **Screenshot 20:** Audit Logs page (`/audit-logs`) — showing action trail

---

## Demo Flow Script (Recommended Order)

| Step | Route | Duration | What to Show |
|------|-------|----------|--------------|
| 1 | `/` | 2 min | Landing page — institutional value prop, regulatory positioning |
| 2 | `/auth` | 1 min | Sign up / sign in — demonstrate authentication |
| 3 | `/admin/upload` | 5 min | **Star of the demo** — upload a PDF, show AI metadata extraction |
| 4 | `/admin/repository` | 3 min | Show where file landed, metadata structure, architecture |
| 5 | `/library` | 2 min | Find the uploaded book in catalog, demonstrate search |
| 6 | `/reader` | 3 min | Open a chapter, use AI panel (summary, Q&A) |
| 7 | `/collections` | 3 min | Show tier-gated collections (switch between Basic/Pro) |
| 8 | `/collections/:id` | 2 min | Collection detail + Add-On Builder (Pro only) |
| 9 | `/enterprise` | 2 min | Dashboard — seats, usage, AI stats |
| 10 | `/counter-reports` | 3 min | COUNTER 5.1 reports + CSV export |
| 11 | `/audit-logs` | 2 min | Governance trail |
| 12 | `/subscribe` | 2 min | Pricing page — 3-tier institutional licensing |

**Total estimated demo time: 30 minutes**

---

## Screenshot Checklist Summary

| # | Page | What to Capture |
|---|------|----------------|
| 1 | `/admin/repository` | Architecture cards + books table |
| 2 | `/admin/repository` | Storage bucket file listing |
| 3 | `/collections` | Basic tier — locked collections |
| 4 | `/collections` | Pro tier — all unlocked |
| 5 | `/enterprise` | Dashboard with seat utilization |
| 6 | `/admin/repository` | Books metadata table detail |
| 7 | Backend DB view | Raw `books` table data |
| 8 | `/admin/upload` | File upload drop zone |
| 9 | `/admin/upload` | AI extraction in progress |
| 10 | `/admin/upload` | AI-populated metadata fields |
| 11 | `/admin/upload` | Auto-detected medical tags |
| 12 | `/library` | Book grid with specialty badges |
| 13 | `/library` | Search results |
| 14 | `/reader` | Chapter content + AI panel |
| 15 | `/reader` | AI response with internal source |
| 16 | `/counter-reports` | TR_B1 report |
| 17 | `/counter-reports` | TR_B3 monthly report |
| 18 | `/counter-reports` | CSV export |
| 19 | `/enterprise` | Usage stats cards |
| 20 | `/audit-logs` | Action trail |

---

## Pre-Demo Checklist

- [ ] Sign up a demo account at `/auth`
- [ ] Have a sample PDF ready for live upload
- [ ] Log in to enterprise modal with all 3 tiers prepared (Metro General = Enterprise, Bayview = Pro, Community Health = Basic)
- [ ] Verify backend tables have data (check via Lovable Cloud)
- [ ] Test AI panel generates responses
- [ ] Confirm CSV export downloads correctly
- [ ] Check all routes load without errors

---

## Stakeholder Q&A Preparation

| Question | Answer |
|----------|--------|
| Is content HIPAA-compliant? | Published medical references only — no PHI stored |
| Can we bulk-upload books? | Yes — admin upload supports EPUB and PDF with AI extraction |
| How is AI restricted? | Chapter-scoped only, internal content only, all queries logged |
| What about SSO? | Planned for Phase 2 — current auth is email/password |
| Can librarians export data? | Yes — COUNTER 5.1 CSV exports available |
| Is data isolated between institutions? | Yes — PostgreSQL Row-Level Security enforces tenant isolation |
| What happens when seat limit is reached? | Warning at 90%, hard block at 100% with upgrade CTA |

---

*Report generated for Sarasota stakeholder demo preparation.*
