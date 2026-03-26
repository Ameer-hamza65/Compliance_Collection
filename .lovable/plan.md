

# Fix EPUB Image Parsing + Book Info Page + Front-Matter as Metadata

## What the Client Wants (from R2 Library screenshots)

1. **Book "Title Page"** = First page shows: cover image, author, publisher, ISBN, edition, publication date, description — like R2's detail page. NOT a rendered chapter.
2. **Front Matter** (Preface, Acknowledgments, About, References) = grouped under a collapsible "Front Matter" section in TOC, not as separate chapters.
3. **Only real chapters** (Chapter One, Chapter Two, etc.) appear as main chapters.
4. **Appendix** sections appear at the end, properly labeled.
5. **All images** must render — the current blob URL resolution is failing for some path patterns.

## Root Causes

1. **Images not resolving**: The `resolveImageSrc` function tries limited path variations. EPUB images can live in nested directories with various relative path schemes (`../images/`, `images/`, `OEBPS/images/`, etc.). Need to enumerate ALL files in the archive and do fuzzy filename matching as a last resort.

2. **No "Book Info" first page**: The reader jumps straight into chapter content. Need a synthetic "Title Page" view using admin-entered metadata + cover image.

3. **Front matter treated same as chapters**: Preface, Acknowledgments, About, References are currently either skipped entirely or shown as regular chapters. Per R2's model, they should be grouped under a collapsible "Front Matter" header in the TOC.

## Plan

### 1. Fix Image Resolution in `src/lib/epubParser.ts`
- After extracting the archive, build a **full file index** of all files in the EPUB zip using `archive.zip` or iterating archive entries.
- In `resolveImageSrc`, after trying direct path matches, add a **fuzzy fallback**: match by filename only (e.g., `pub.jpg`) against the full file index.
- This catches images regardless of how deeply nested or oddly referenced they are.

### 2. Add Book Info Page as First "Chapter" in Reader (`src/pages/Reader.tsx`)
- When the reader loads, inject a synthetic **"Title Page"** as the first view (before chapter 1).
- This page renders: cover image (from `book.coverUrl` or extracted cover), title, subtitle, authors, publisher, ISBN, edition, publication date, description — all from the book metadata that was entered during admin upload.
- In the TOC panel, this shows as "Book Info" or the book title at the top, visually distinct.

### 3. Categorize Front Matter & Appendix in TOC (`src/lib/epubParser.ts` + `src/components/reader/TOCPanel.tsx`)
- In the parser, add a `category` field to `ParsedChapter`: `'front-matter' | 'chapter' | 'appendix'`.
- Detect front matter titles: Preface, Acknowledgments, About, References, Foreword, Introduction (when before Chapter 1).
- Detect appendix titles: anything matching `/^appendix/i`.
- **Do NOT skip** these — include them with their category tag.
- Update `TOCPanel` to group chapters by category with collapsible headers: "Front Matter", then numbered chapters, then "Appendix".

### 4. Update Chapter type (`src/data/mockEpubData.ts`)
- Add optional `category?: 'front-matter' | 'chapter' | 'appendix'` to the `Chapter` interface.

### Files to Change
| File | Change |
|------|--------|
| `src/data/mockEpubData.ts` | Add `category` field to Chapter interface |
| `src/lib/epubParser.ts` | Fix image resolution with full archive index + fuzzy match; categorize chapters as front-matter/chapter/appendix instead of skipping front matter |
| `src/components/reader/TOCPanel.tsx` | Group TOC by category with collapsible Front Matter / Appendix sections |
| `src/pages/Reader.tsx` | Add synthetic "Book Info" title page as first view with metadata + cover |

