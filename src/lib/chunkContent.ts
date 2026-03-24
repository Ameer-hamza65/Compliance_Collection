// Chunk-level content parser — breaks chapter HTML content into addressable blocks

export interface ContentChunk {
  id: string;
  index: number;
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'blockquote' | 'figure' | 'code' | 'other';
  content: string; // raw HTML for this chunk
  label?: string;
}

// Block-level tags that should become their own chunk
const BLOCK_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'div',
  'ul', 'ol', 'dl',
  'table',
  'blockquote',
  'pre',
  'figure',
  'hr',
  'section', 'article',
]);

function getChunkType(tagName: string): ContentChunk['type'] {
  if (/^h[1-6]$/.test(tagName)) return 'heading';
  if (tagName === 'ul' || tagName === 'ol' || tagName === 'dl') return 'list';
  if (tagName === 'table') return 'table';
  if (tagName === 'blockquote') return 'blockquote';
  if (tagName === 'figure') return 'figure';
  if (tagName === 'pre') return 'code';
  return 'paragraph';
}

function getChunkLabel(tagName: string): string | undefined {
  if (/^h[1-6]$/.test(tagName)) return undefined; // headings are self-explanatory
  if (tagName === 'blockquote') return 'Note';
  if (tagName === 'table') return 'Table';
  if (tagName === 'figure') return 'Figure';
  if (tagName === 'pre') return 'Code';
  return undefined;
}

/**
 * Breaks HTML chapter content into semantically meaningful chunks
 * by splitting on block-level HTML elements.
 */
export function chunkChapterContent(chapterId: string, rawContent: string): ContentChunk[] {
  // If no content, return empty
  if (!rawContent || rawContent.trim().length === 0) return [];

  const chunks: ContentChunk[] = [];
  let chunkIndex = 0;

  const pushChunk = (type: ContentChunk['type'], html: string, label?: string) => {
    // Skip empty chunks
    const textOnly = html.replace(/<[^>]*>/g, '').trim();
    if (!textOnly && !html.includes('<img') && !html.includes('<table')) return;

    chunks.push({
      id: `${chapterId}-chunk-${chunkIndex}`,
      index: chunkIndex,
      type,
      content: html,
      label,
    });
    chunkIndex++;
  };

  // Check if content is HTML or plain text
  const isHtml = /<[a-z][\s\S]*>/i.test(rawContent);

  if (!isHtml) {
    // Plain text fallback — split by double newlines into paragraphs
    const paragraphs = rawContent.split(/\n\s*\n/).filter(p => p.trim());
    for (const para of paragraphs) {
      pushChunk('paragraph', `<p>${para.trim()}</p>`);
    }
    if (chunks.length === 0) {
      pushChunk('paragraph', `<p>${rawContent.trim()}</p>`);
    }
    return chunks;
  }

  // Parse HTML using DOMParser
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${rawContent}</div>`, 'text/html');
    const container = doc.body.firstElementChild || doc.body;

    // Walk top-level children
    for (const node of Array.from(container.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text && text.length > 0) {
          pushChunk('paragraph', `<p>${text}</p>`);
        }
        continue;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) continue;

      const el = node as Element;
      const tagName = el.tagName.toLowerCase();
      const outerHtml = el.outerHTML;

      if (BLOCK_TAGS.has(tagName)) {
        // Section/article/div: recurse into children as separate chunks
        if (tagName === 'section' || tagName === 'article' || tagName === 'div') {
          // If div has meaningful direct text or only inline children, treat as one chunk
          const hasBlockChildren = Array.from(el.children).some(
            child => BLOCK_TAGS.has(child.tagName.toLowerCase())
          );

          if (hasBlockChildren) {
            // Recurse: each block child becomes its own chunk
            for (const child of Array.from(el.childNodes)) {
              if (child.nodeType === Node.TEXT_NODE) {
                const text = child.textContent?.trim();
                if (text && text.length > 0) {
                  pushChunk('paragraph', `<p>${text}</p>`);
                }
              } else if (child.nodeType === Node.ELEMENT_NODE) {
                const childEl = child as Element;
                const childTag = childEl.tagName.toLowerCase();
                const type = getChunkType(childTag);
                const label = getChunkLabel(childTag);
                pushChunk(type, childEl.outerHTML, label);
              }
            }
          } else {
            // Flat div — treat as paragraph
            pushChunk('paragraph', outerHtml);
          }
        } else if (tagName === 'hr') {
          // Skip horizontal rules as standalone chunks
          continue;
        } else {
          const type = getChunkType(tagName);
          const label = getChunkLabel(tagName);
          pushChunk(type, outerHtml, label);
        }
      } else {
        // Inline or unknown element — wrap in paragraph
        pushChunk('paragraph', outerHtml);
      }
    }
  } catch (e) {
    console.warn('[chunkChapterContent] DOM parsing failed, treating as single chunk:', e);
    pushChunk('paragraph', rawContent);
  }

  // If we ended up with no chunks, create one from the raw content
  if (chunks.length === 0) {
    pushChunk('paragraph', rawContent);
  }

  return chunks;
}
