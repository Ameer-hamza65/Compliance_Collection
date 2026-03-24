import ePub, { Book, NavItem } from 'epubjs';

export interface ParsedChapter {
  id: string;
  title: string;
  content: string;
  pageNumber: number;
  href: string;
  tags: string[];
}
 
// AI-powered function to improve chapter titles and organization
// This can be called after parsing to enhance chapter metadata
export async function enhanceChaptersWithAI(
  chapters: ParsedChapter[],
  bookTitle: string,
  supabaseClient: any
): Promise<ParsedChapter[]> {
  if (!supabaseClient || chapters.length === 0) {
    return chapters;
  }

  try {
    // Process chapters in batches to avoid overwhelming the AI
    const batchSize = 5;
    const enhancedChapters: ParsedChapter[] = [];

    for (let i = 0; i < chapters.length; i += batchSize) {
      const batch = chapters.slice(i, i + batchSize);
      
      for (const chapter of batch) {
        // Skip if content is too short
        if (chapter.content.length < 100) {
          enhancedChapters.push(chapter);
          continue;
        }

        try {
          // Use AI to generate a better title from content
          const { data, error } = await supabaseClient.functions.invoke('gemini-ai', {
            body: {
              prompt: `You are analyzing a medical textbook chapter to generate a concise, descriptive title.

Book: "${bookTitle}"
Current title: "${chapter.title}"
Chapter content preview: "${chapter.content.slice(0, 500)}..."

Generate a clear, professional chapter title (maximum 80 characters) that accurately describes the chapter's main topic. Return ONLY the title, no explanations or markdown.`,
              chapterContent: chapter.content.slice(0, 2000), // Use first 2000 chars for title generation
              chapterTitle: chapter.title,
              bookTitle: bookTitle,
              type: 'general',
            },
          });

          if (!error && data?.content) {
            const aiTitle = (data.content as string).trim().slice(0, 80);
            if (aiTitle && aiTitle.length > 5) {
              enhancedChapters.push({
                ...chapter,
                title: aiTitle,
              });
              continue;
            }
          }
        } catch (err) {
          console.warn(`AI title enhancement failed for chapter "${chapter.title}":`, err);
        }

        // Fallback: use original chapter
        enhancedChapters.push(chapter);
      }
    }

    return enhancedChapters;
  } catch (err) {
    console.error('AI chapter enhancement failed:', err);
    return chapters; // Return original chapters on error
  }
}

export interface ParsedEpubData {
  title: string;
  authors: string[];
  publisher: string;
  isbn: string;
  description: string;
  language: string;
  publishedDate: string;
  tableOfContents: ParsedChapter[];
  coverUrl?: string;
}

// Extract text content from HTML (works in browser and SSR)
function extractTextFromHtml(html: string): string {
  try {
    if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const scripts = doc.querySelectorAll('script, style');
      scripts.forEach((el) => el.remove());
      const text = doc.body?.textContent || '';
      return text.replace(/\s+/g, ' ').trim();
    }
  } catch {
    // Fall back to regex-based stripping below
  }
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
  const withoutTags = withoutScripts.replace(/<[^>]+>/g, ' ');
  return withoutTags.replace(/\s+/g, ' ').trim();
}

// Front-matter patterns to skip as chapters (these are not real content)
const FRONT_MATTER_SKIP_PATTERNS = [
  /^cover$/i,
  /^title\s*page$/i,
  /^half\s*title/i,
  /^copyright/i,
  /^©/,
  /^all\s*rights\s*reserved/i,
  /^table\s*of\s*contents$/i,
  /^contents$/i,
  /^toc$/i,
  /^dedication$/i,
  /^epigraph$/i,
  /^frontispiece$/i,
  /^list\s*of\s*(figures|tables|illustrations|contributors|abbreviations)/i,
  /^about\s*the\s*authors?$/i,
  /^series\s*page$/i,
  /^also\s*by/i,
  /^praise\s*for/i,
  /^endorsements?$/i,
  /^blank\s*page$/i,
];

// Href-based patterns for front matter files
const FRONT_MATTER_HREF_PATTERNS = [
  /cover\./i,
  /titlepage\./i,
  /copyright\./i,
  /^toc\./i,
  /nav\.x?html/i,
];

function isFrontMatter(title: string, href: string): boolean {
  const trimmedTitle = title.trim();
  if (FRONT_MATTER_SKIP_PATTERNS.some(pat => pat.test(trimmedTitle))) return true;
  if (FRONT_MATTER_HREF_PATTERNS.some(pat => pat.test(href))) return true;
  return false;
}

// Allowed HTML tags whitelist for clean HTML extraction
const ALLOWED_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'div', 'span', 'br',
  'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  'blockquote', 'pre', 'code',
  'strong', 'em', 'b', 'i', 'u', 'sub', 'sup', 's',
  'figure', 'figcaption', 'img',
  'a', 'abbr', 'cite', 'dfn', 'small',
  'dl', 'dt', 'dd',
  'section', 'article', 'aside', 'header', 'footer', 'nav',
  'hr',
]);

/**
 * Extract clean HTML from raw EPUB XHTML, preserving semantic structure
 * while removing scripts, styles, and epub-specific cruft.
 */
function extractCleanHtml(html: string): string {
  try {
    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
      // Fallback: strip dangerous tags but keep structure
      return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<link[^>]*>/gi, '')
        .replace(/<meta[^>]*>/gi, '')
        .trim();
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove unwanted elements
    doc.querySelectorAll('script, style, link, meta, iframe, object, embed, svg').forEach(el => el.remove());

    // Remove epub navigation elements
    doc.querySelectorAll('[epub\\:type="pagebreak"], [role="doc-pagebreak"]').forEach(el => el.remove());

    // Sanitize: walk the DOM and keep only allowed tags
    function sanitizeNode(node: Node): Node | null {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.cloneNode(true);
      }
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
      }

      const el = node as Element;
      const tagName = el.tagName.toLowerCase();

      // If tag is allowed, keep it with cleaned attributes
      if (ALLOWED_TAGS.has(tagName)) {
        const newEl = document.createElement(tagName);

        // Preserve only safe attributes
        if (tagName === 'img') {
          const src = el.getAttribute('src');
          const alt = el.getAttribute('alt');
          if (src) newEl.setAttribute('src', src);
          if (alt) newEl.setAttribute('alt', alt);
        }
        if (tagName === 'a') {
          const href = el.getAttribute('href');
          if (href) newEl.setAttribute('href', href);
        }
        if (tagName === 'td' || tagName === 'th') {
          const colspan = el.getAttribute('colspan');
          const rowspan = el.getAttribute('rowspan');
          if (colspan) newEl.setAttribute('colspan', colspan);
          if (rowspan) newEl.setAttribute('rowspan', rowspan);
        }

        // Recurse into children
        for (const child of Array.from(el.childNodes)) {
          const sanitized = sanitizeNode(child);
          if (sanitized) newEl.appendChild(sanitized);
        }

        return newEl;
      }

      // Tag not allowed — unwrap its children (keep text content)
      const fragment = document.createDocumentFragment();
      for (const child of Array.from(el.childNodes)) {
        const sanitized = sanitizeNode(child);
        if (sanitized) fragment.appendChild(sanitized);
      }
      return fragment;
    }

    const body = doc.body;
    if (!body) return '';

    const cleanFragment = document.createDocumentFragment();
    for (const child of Array.from(body.childNodes)) {
      const sanitized = sanitizeNode(child);
      if (sanitized) cleanFragment.appendChild(sanitized);
    }

    // Serialize back to HTML
    const wrapper = document.createElement('div');
    wrapper.appendChild(cleanFragment);
    
    const result = wrapper.innerHTML.trim();
    return result;
  } catch (e) {
    console.warn('[extractCleanHtml] Failed, falling back to text extraction:', e);
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .trim();
  }
}

// Helper: safely load chapter XHTML and return clean HTML (preserving formatting)
async function getChapterText(book: Book, href: string): Promise<string> {
  if (!href) {
    console.warn('[getChapterText] Empty href provided');
    return '';
  }

  const anyBook = book as any;
  const normalizedHref = href.startsWith('/') ? href.slice(1) : href;
  
  console.log(`[getChapterText] Attempting to extract content from href: "${href}" (normalized: "${normalizedHref}")`);

  // Method 1: Try book.get() - this is the recommended epubjs way
  try {
    if (anyBook.get) {
      const section = await anyBook.get(href);
      if (section) {
        const doc = await section.load(book.load.bind(book));
        if (doc && (doc instanceof Document || doc instanceof Element)) {
          const serializer = new XMLSerializer();
          const htmlString = serializer.serializeToString(doc as Document | Element);
          const text = extractCleanHtml(htmlString);
          if (text && text.length > 0) {
            console.log(`[getChapterText] Success via book.get(): ${text.length} chars`);
            return text;
          }
        }
      }
    }
  } catch (e) {
    console.warn(`[getChapterText] book.get() failed:`, e);
  }

  // Method 2: Try archive.getText() with various path formats
  if (anyBook.archive?.getText) {
    const pathsToTry = [
      normalizedHref,
      href,
      href.replace(/^\.\//, ''),
      href.replace(/^\//, ''),
      decodeURIComponent(href),
      decodeURIComponent(normalizedHref),
    ];

    for (const path of pathsToTry) {
      try {
        const htmlString: string = await anyBook.archive.getText(path);
        if (htmlString && htmlString.trim().length > 0) {
          const text = extractCleanHtml(htmlString);
          if (text && text.length > 0) {
            console.log(`[getChapterText] Success via archive.getText("${path}"): ${text.length} chars`);
            return text;
          }
        }
      } catch (e) {
        // Try next path
      }
    }
  }

  // Method 3: Try spine.get() and load
  try {
    let section = book.spine.get(href as any);
    if (!section) {
      section = book.spine.get(normalizedHref as any);
    }
    
    if (section) {
      const doc = await (section as any).load(book.load.bind(book));
      if (doc) {
        const serializer = new XMLSerializer();
        const htmlString = serializer.serializeToString(doc);
        const text = extractCleanHtml(htmlString);
        if (text && text.length > 0) {
          console.log(`[getChapterText] Success via spine.get().load(): ${text.length} chars`);
          return text;
        }
      } 
    }
  } catch (e) {
    console.warn(`[getChapterText] spine.get().load() failed:`, e);
  }

  // Method 4: Try archive.getBlob() and convert to text
  if (anyBook.archive?.getBlob) {
    const pathsToTry = [normalizedHref, href];
    for (const path of pathsToTry) {
      try {
        const blob = await anyBook.archive.getBlob(path);
        if (blob) {
          const rawText = await blob.text();
          const extracted = extractCleanHtml(rawText);
          if (extracted && extracted.length > 0) {
            console.log(`[getChapterText] Success via archive.getBlob("${path}"): ${extracted.length} chars`);
            return extracted;
          }
        }
      } catch (e) {
        // Try next path
      }
    }
  }

  // Method 5: Try using book.load() directly
  try {
    const doc = await (book as any).load(href);
    if (doc && (doc instanceof Document || doc instanceof Element)) {
      const serializer = new XMLSerializer();
      const htmlString = serializer.serializeToString(doc as Document | Element);
      const text = extractCleanHtml(htmlString);
      if (text && text.length > 0) {
        console.log(`[getChapterText] Success via book.load(): ${text.length} chars`);
        return text;
      }
    }
  } catch (e) {
    console.warn(`[getChapterText] book.load() failed:`, e);
  }

  // Method 6: Try accessing spine items directly
  try {
    const spine = book.spine as any;
    if (spine.items) {
      for (const item of spine.items) {
        if (item.href === href || item.href === normalizedHref || item.href?.endsWith(href) || item.href?.endsWith(normalizedHref)) {
          const doc = await item.load(book.load.bind(book));
          if (doc && (doc instanceof Document || doc instanceof Element)) {
            const serializer = new XMLSerializer();
            const htmlString = serializer.serializeToString(doc as Document | Element);
            const text = extractCleanHtml(htmlString);
            if (text && text.length > 0) {
              console.log(`[getChapterText] Success via spine.items iteration: ${text.length} chars`);
              return text;
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn(`[getChapterText] spine.items iteration failed:`, e);
  }

  console.error(`[getChapterText] All methods failed for href: "${href}"`);
  return '';
}

// Parse EPUB file and extract metadata, description and content
export async function parseEpubFile(file: File): Promise<ParsedEpubData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer; 
        const book: Book = ePub(arrayBuffer);
        
        // Wait for book to be ready
        await book.ready;
        
        // Get metadata
        const metadata = book.packaging.metadata;
        
        // Get navigation/TOC
        const navigation = await book.loaded.navigation;
        
        // Extract chapters with content
        const chapters: ParsedChapter[] = [];
        const tocItems = navigation.toc || [];
        
        // Get all spine items (the actual reading order of the book)
        // epubjs spine can be accessed via book.spine.each() or book.spine.items
        const processedHrefs = new Set<string>();
        const spineHrefs: string[] = [];
        
        // Collect all spine hrefs
        try {
          // Try different ways to access spine items
          const anySpine = book.spine as any;
          if (anySpine.items && Array.isArray(anySpine.items)) {
            anySpine.items.forEach((item: any) => {
              if (item.href) spineHrefs.push(item.href);
            });
          } else if (anySpine.each) {
            anySpine.each((item: any) => {
              if (item && item.href) spineHrefs.push(item.href);
            });
          } else {
            // Fallback: try to get from spine directly
            const spineLength = anySpine.length || 0;
            for (let idx = 0; idx < spineLength; idx++) {
              const item = anySpine.get(idx);
              if (item && item.href) spineHrefs.push(item.href);
            }
          }
        } catch (e) {
          console.warn('Could not enumerate spine items:', e);
        }
        
        // First, process TOC items (they have titles)
        let chaptersWithContent = 0;
        for (let i = 0; i < tocItems.length; i++) {
          const item: NavItem = tocItems[i];
          if (!item.href) continue;

          // Skip front-matter entries (copyright, cover, TOC page, etc.)
          if (isFrontMatter(item.label || '', item.href)) {
            console.log(`[parseEpubFile] Skipping front-matter TOC item: "${item.label}" (href: "${item.href}")`);
            processedHrefs.add(item.href);
            continue;
          }
          
          console.log(`[parseEpubFile] Processing TOC item ${i + 1}/${tocItems.length}: "${item.label}" (href: "${item.href}")`);
          const content = await getChapterText(book, item.href);
          
          // REMOVED 2000 char limit - keep FULL content!
          const hasContent = content && content.trim().length > 0;
          if (hasContent) {
            chaptersWithContent++;
            console.log(`[parseEpubFile] ✓ Extracted ${content.length} chars for "${item.label}"`);
          } else {
            console.warn(`[parseEpubFile] ✗ Failed to extract content for "${item.label}" (href: "${item.href}")`);
          }
          
          const tags = autoDetectMedicalTags(extractTextFromHtml(content || item.label || ''));
          
          chapters.push({
            id: `ch-${Date.now()}-${i + 1}`,
            title: item.label || `Chapter ${i + 1}`,
            content: content || '', // Don't use placeholder text - empty string means failed extraction
            pageNumber: (i + 1) * 20, // Estimate page numbers
            href: item.href,
            tags,
          });
          
          processedHrefs.add(item.href);
          
          // Process nested items if any
          if (item.subitems && item.subitems.length > 0) {
            for (let j = 0; j < item.subitems.length; j++) {
              const subitem = item.subitems[j];
              if (!subitem.href || processedHrefs.has(subitem.href)) continue;

              // Skip front-matter subitems too
              if (isFrontMatter(subitem.label || '', subitem.href)) {
                console.log(`[parseEpubFile] Skipping front-matter subitem: "${subitem.label}"`);
                processedHrefs.add(subitem.href);
                continue;
              }
              
              console.log(`[parseEpubFile] Processing subitem ${j + 1}: "${subitem.label}" (href: "${subitem.href}")`);
              const subContent = await getChapterText(book, subitem.href);
              const hasSubContent = subContent && subContent.trim().length > 0;
              
              if (hasSubContent) {
                chaptersWithContent++;
                console.log(`[parseEpubFile] ✓ Extracted ${subContent.length} chars for subitem "${subitem.label}"`);
              } else {
                console.warn(`[parseEpubFile] ✗ Failed to extract content for subitem "${subitem.label}"`);
              }
              
              const subTags = autoDetectMedicalTags(extractTextFromHtml(subContent || subitem.label || ''));
              
              chapters.push({
                id: `ch-${Date.now()}-${i + 1}-${j + 1}`,
                title: subitem.label || `Section ${j + 1}`,
                content: subContent || '', // Empty string if extraction failed
                pageNumber: (i + 1) * 20 + (j + 1) * 5,
                href: subitem.href,
                tags: subTags,
              });
              
              processedHrefs.add(subitem.href);
            }
          }
        }
        
        console.log(`[parseEpubFile] TOC processing complete: ${chaptersWithContent}/${chapters.length} chapters have content`);
        
        // If TOC is empty, incomplete, OR if TOC items had no content, extract ALL spine items
        const needsSpineExtraction = chapters.length === 0 || 
                                     chaptersWithContent === 0 || 
                                     (spineHrefs.length > 0 && spineHrefs.length > chapters.length);
        
        if (needsSpineExtraction) {
          console.log(`[parseEpubFile] TOC had ${tocItems.length} items (${chaptersWithContent} with content), but spine has ${spineHrefs.length} items. Extracting all spine items...`);
          
          let spineChaptersWithContent = 0;
          for (let i = 0; i < spineHrefs.length; i++) {
            const href = spineHrefs[i];
            
            if (!href || processedHrefs.has(href)) continue;

            // Skip front-matter spine items
            if (isFrontMatter('', href)) {
              console.log(`[parseEpubFile] Skipping front-matter spine item: "${href}"`);
              processedHrefs.add(href);
              continue;
            }
            
            try {
              console.log(`[parseEpubFile] Processing spine item ${i + 1}/${spineHrefs.length}: "${href}"`);
              const content = await getChapterText(book, href);
              
              // Skip if content is too short (likely a cover/image/nav file)
              if (content.length < 50) {
                console.log(`[parseEpubFile] Skipping spine item "${href}" - content too short (${content.length} chars)`);
                continue;
              }
              
              spineChaptersWithContent++;
              console.log(`[parseEpubFile] ✓ Extracted ${content.length} chars from spine item "${href}"`);
              
              const plainText = extractTextFromHtml(content);
              const tags = autoDetectMedicalTags(plainText);
              
              // Try to extract a title from HTML headings first, then first line
              let title = `Chapter ${chapters.length + 1}`;
              try {
                const titleParser = new DOMParser();
                const titleDoc = titleParser.parseFromString(`<div>${content}</div>`, 'text/html');
                const heading = titleDoc.querySelector('h1, h2, h3, h4');
                if (heading && heading.textContent && heading.textContent.trim().length > 3) {
                  title = heading.textContent.trim().slice(0, 100);
                } else {
                  const firstP = titleDoc.querySelector('p');
                  if (firstP && firstP.textContent && firstP.textContent.trim().length > 10) {
                    title = firstP.textContent.trim().slice(0, 100);
                  }
                }
              } catch {
                // fallback title is fine
              }
              
              chapters.push({
                id: `ch-spine-${Date.now()}-${i + 1}`,
                title: title,
                content: content, // FULL content, no truncation!
                pageNumber: (chapters.length + 1) * 20,
                href: href,
                tags,
              });
              
              processedHrefs.add(href);
            } catch (err) {
              console.warn(`[parseEpubFile] Failed to extract spine item ${i} (href: "${href}"):`, err);
            }
          }
          
          console.log(`[parseEpubFile] Spine extraction complete: ${spineChaptersWithContent} chapters with content`);
        }
        
        // Final check: filter out chapters with no content
        const validChapters = chapters.filter(ch => ch.content && ch.content.trim().length > 0);
        if (validChapters.length < chapters.length) {
          console.warn(`[parseEpubFile] Filtering out ${chapters.length - validChapters.length} chapters with no content`);
        }
        
        // Use valid chapters, or keep all if we have at least some content
        const finalChapters = validChapters.length > 0 ? validChapters : chapters;
        
        // Try to get cover
        let coverUrl: string | undefined;
        try {
          const coverHref = book.packaging.coverPath;
          if (coverHref) {
            const coverBlob = await book.archive.getBlob(coverHref);
            if (coverBlob) {
              coverUrl = URL.createObjectURL(coverBlob);
            }
          }
        } catch (err) {
          console.warn('Could not extract cover image', err);
        }
        
        // Extract ISBN from identifiers
        let isbn = '';
        const identifier = (metadata as any).identifier as string | undefined;
        if (identifier) {
          // Check if it looks like an ISBN
          const isbnMatch = identifier.match(/^(?:urn:isbn:)?(\d{10}|\d{13}|\d{3}-\d{10})$/i);
          if (isbnMatch) {
            isbn = isbnMatch[1] || identifier;
          } else {
            isbn = identifier;
          }
        }
        
        // Parse authors - handle both string and array
        let authors: string[] = [];
        const creator = (metadata as any).creator;
        if (creator) {
          if (typeof creator === 'string') {
            authors = [creator];
          } else if (Array.isArray(creator)) {
            authors = creator;
          }
        }

        // Derive a description: prefer metadata, otherwise use first chapter content
        let description = (metadata as any).description as string | undefined;
        if (!description || !description.trim()) {
          const firstWithContent = chapters.find(
            (ch) => ch.content && ch.content.trim().length > 0,
          );
          if (firstWithContent) {
            const raw = extractTextFromHtml(firstWithContent.content).replace(/\s+/g, ' ').trim();
            description = raw.slice(0, 600) + (raw.length > 600 ? '…' : '');
          } else {
            description = 'No description available.';
          }
        }
        
        const result: ParsedEpubData = {
          title: metadata.title || file.name.replace('.epub', ''),
          authors: authors.length > 0 ? authors : ['Unknown Author'],
          publisher: metadata.publisher || 'Unknown Publisher',
          isbn: isbn || `978-${Math.random().toString().slice(2, 12)}`,
          description,
          language: metadata.language || 'en',
          publishedDate: metadata.pubdate || new Date().toISOString().split('T')[0],
          tableOfContents: finalChapters.length > 0 ? finalChapters : generateDefaultChapters(),
          coverUrl,
        };
        
        console.log(`[parseEpubFile] Final result: ${result.tableOfContents.length} chapters, ${result.tableOfContents.filter(ch => ch.content && ch.content.length > 0).length} with content`);
        
        // Clean up
        book.destroy();
        
        resolve(result);
      } catch (error) {
        console.error('Error parsing EPUB:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

// Generate default chapters if TOC extraction fails
function generateDefaultChapters(): ParsedChapter[] {
  const timestamp = Date.now();
  return [
    {
      id: `ch-${timestamp}-1`,
      title: 'Chapter 1: Introduction',
      content: 'Introduction to the fundamental concepts covered in this textbook.',
      pageNumber: 1,
      href: '',
      tags: [],
    },
    {
      id: `ch-${timestamp}-2`,
      title: 'Chapter 2: Core Concepts',
      content: 'Core concepts and foundational knowledge.',
      pageNumber: 25,
      href: '',
      tags: [],
    },
    {
      id: `ch-${timestamp}-3`,
      title: 'Chapter 3: Applications',
      content: 'Practical applications and clinical examples.',
      pageNumber: 75,
      href: '',
      tags: [],
    },
  ];
}

// Auto-detect medical tags based on content
export function autoDetectMedicalTags(content: string): string[] {
  const contentLower = content.toLowerCase();
  const detectedTags: string[] = [];
  
  const tagKeywords: Record<string, string[]> = {
    'diabetes': ['diabetes', 'diabetic', 'hyperglycemia', 'hypoglycemia', 'glucose', 'hba1c'],
    'hypertension': ['hypertension', 'blood pressure', 'hypertensive', 'antihypertensive'],
    'heart-failure': ['heart failure', 'cardiac failure', 'cardiomyopathy', 'ejection fraction'],
    'copd': ['copd', 'chronic obstructive', 'emphysema', 'bronchitis'],
    'asthma': ['asthma', 'bronchospasm', 'wheezing', 'bronchodilator'],
    'pneumonia': ['pneumonia', 'pulmonary infection', 'lung infection'],
    'sepsis': ['sepsis', 'septic', 'bacteremia'],
    'stroke': ['stroke', 'cerebrovascular', 'ischemic stroke', 'hemorrhagic stroke'],
    'mi': ['myocardial infarction', 'heart attack', 'stemi', 'nstemi', 'acute coronary'],
    'arrhythmia': ['arrhythmia', 'atrial fibrillation', 'tachycardia', 'bradycardia'],
    'metformin': ['metformin', 'glucophage'],
    'insulin': ['insulin', 'basal insulin', 'bolus insulin'],
    'lisinopril': ['lisinopril', 'ace inhibitor', 'angiotensin'],
    'aspirin': ['aspirin', 'acetylsalicylic', 'antiplatelet'],
    'warfarin': ['warfarin', 'coumadin', 'anticoagulant', 'inr'],
    'beta-blockers': ['beta blocker', 'metoprolol', 'atenolol', 'carvedilol'],
    'statins': ['statin', 'atorvastatin', 'simvastatin', 'cholesterol'],
    'antibiotics': ['antibiotic', 'antimicrobial', 'penicillin', 'cephalosporin'],
    'ecg': ['ecg', 'ekg', 'electrocardiogram', 'electrocardiography'],
    'catheterization': ['catheterization', 'cardiac cath', 'angiography'],
    'intubation': ['intubation', 'endotracheal', 'mechanical ventilation'],
    'dialysis': ['dialysis', 'hemodialysis', 'peritoneal dialysis'],
    'heart': ['heart', 'cardiac', 'coronary', 'myocardial'],
    'lungs': ['lung', 'pulmonary', 'respiratory'],
    'kidney': ['kidney', 'renal', 'nephron'],
    'brain': ['brain', 'cerebral', 'neurological'],
    'cardiology': ['cardiology', 'cardiovascular'],
    'pulmonology': ['pulmonology', 'respiratory medicine'],
    'endocrinology': ['endocrinology', 'endocrine', 'hormonal'],
    'nephrology': ['nephrology', 'renal medicine'],
    'neurology': ['neurology', 'neurological'],
    'emergency': ['emergency', 'acute care', 'critical care'],
  };
  
  for (const [tagId, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(keyword => contentLower.includes(keyword))) {
      detectedTags.push(tagId);
    } 
  }
  return detectedTags;
}