// Chunk-level content parser — breaks chapter content into addressable paragraphs/sections

export interface ContentChunk {
  id: string;
  index: number;
  type: 'heading' | 'paragraph' | 'clinical-pearl' | 'key-point' | 'procedure-step' | 'drug-info' | 'reference';
  content: string;
  label?: string;
}

/**
 * Breaks raw chapter text into semantically meaningful chunks
 * for paragraph/section-level navigation and AI interaction.
 */
export function chunkChapterContent(chapterId: string, rawContent: string): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  
  // Split into sentences and group into logical paragraphs
  const sentences = rawContent.match(/[^.!?]+[.!?]+/g) || [rawContent];
  
  let currentParagraph: string[] = [];
  let chunkIndex = 0;

  const pushChunk = (type: ContentChunk['type'], content: string, label?: string) => {
    chunks.push({
      id: `${chapterId}-chunk-${chunkIndex}`,
      index: chunkIndex,
      type,
      content: content.trim(),
      label,
    });
    chunkIndex++;
  };

  // Parse sentences into typed chunks
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    
    // Detect clinical pearl patterns
    if (sentence.toLowerCase().includes('important') || 
        sentence.toLowerCase().includes('clinical pearl') ||
        sentence.toLowerCase().includes('key point')) {
      // Flush current paragraph
      if (currentParagraph.length > 0) {
        pushChunk('paragraph', currentParagraph.join(' '));
        currentParagraph = [];
      }
      pushChunk('clinical-pearl', sentence, 'Clinical Pearl');
      continue;
    }

    // Detect procedure/protocol patterns
    if (sentence.toLowerCase().includes('procedure') || 
        sentence.toLowerCase().includes('protocol') ||
        sentence.toLowerCase().includes('step ') ||
        sentence.toLowerCase().includes('guidelines')) {
      if (currentParagraph.length > 0) {
        pushChunk('paragraph', currentParagraph.join(' '));
        currentParagraph = [];
      }
      pushChunk('procedure-step', sentence, 'Protocol / Procedure');
      continue;
    }

    // Detect drug information patterns
    if (sentence.toLowerCase().includes('mg') || 
        sentence.toLowerCase().includes('dosage') ||
        sentence.toLowerCase().includes('dose') ||
        sentence.toLowerCase().includes('pharmacotherapy')) {
      if (currentParagraph.length > 0) {
        pushChunk('paragraph', currentParagraph.join(' '));
        currentParagraph = [];
      }
      pushChunk('drug-info', sentence, 'Pharmacology');
      continue;
    }

    currentParagraph.push(sentence);

    // Group every 2-3 sentences as a paragraph
    if (currentParagraph.length >= 2) {
      pushChunk('paragraph', currentParagraph.join(' '));
      currentParagraph = [];
    }
  }

  // Flush remaining
  if (currentParagraph.length > 0) {
    pushChunk('paragraph', currentParagraph.join(' '));
  }

  // Add a key-point summary chunk at the end
  pushChunk('key-point', `Key concepts covered in this section include the foundational principles, diagnostic criteria, and evidence-based management strategies discussed above. Review the highlighted clinical pearls for rapid reference.`, 'Key Points Summary');

  return chunks;
}
