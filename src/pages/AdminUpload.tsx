import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, FileText, Book, Tag, Plus, X, Check, 
  AlertCircle, Loader2, Settings, ChevronRight, Save, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useBooks } from '@/context/BookContext';
import { medicalTags, EpubBook } from '@/data/mockEpubData';
import { parseEpubFile, ParsedChapter, ParsedEpubData, autoDetectMedicalTags, enhanceChaptersWithAI } from '@/lib/epubParser';
import { supabase } from '@/integrations/supabase/client';

const SPECIALTIES = [
  'Internal Medicine',
  'Cardiology',
  'Pulmonology',
  'Endocrinology',
  'Nephrology',
  'Neurology',
  'Emergency Medicine / Toxicology',
  'Emergency Medicine',
  'Oncology',
  'Pediatrics',
  'Surgery',
  'Psychiatry',
];

const COVER_COLORS = [
  { name: 'Medical Blue', value: 'hsl(213 50% 25%)' },
  { name: 'Cardiology Red', value: 'hsl(0 65% 35%)' },
  { name: 'Pulmonary Blue', value: 'hsl(200 60% 35%)' },
  { name: 'Warning Yellow', value: 'hsl(45 80% 40%)' },
  { name: 'Endocrine Purple', value: 'hsl(280 50% 40%)' },
  { name: 'Neuro Pink', value: 'hsl(340 50% 35%)' },
  { name: 'Nephro Green', value: 'hsl(150 45% 35%)' },
  { name: 'Emergency Orange', value: 'hsl(25 85% 45%)' },
];

export default function AdminUpload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addBook, totalBooks } = useBooks();
  
  const [activeTab, setActiveTab] = useState('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedEpubData | null>(null);
  
  // Form state
  const [bookData, setBookData] = useState({
    title: '',
    subtitle: '',
    authors: [''],
    publisher: '',
    isbn: '',
    publishedYear: new Date().getFullYear(),
    edition: '',
    description: '',
    specialty: '',
    price: 0,
    coverColor: COVER_COLORS[0].value,
  });
  
  const [chapters, setChapters] = useState<ParsedChapter[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isEnhancingChapters, setIsEnhancingChapters] = useState(false);

  // Real EPUB parsing using epubjs
  const parseEpub = useCallback(async (file: File) => {
    setIsParsing(true);
    setParseProgress(10);

    try {
      // Start parsing progress animation
      const progressInterval = setInterval(() => {
        setParseProgress(prev => Math.min(prev + 5, 85));
      }, 300);

      // Parse the EPUB file
      const parsed = await parseEpubFile(file);
      
      clearInterval(progressInterval);
      setParseProgress(95);

      // Auto-detect tags for each chapter
      const chaptersWithTags = parsed.tableOfContents.map(chapter => ({
        ...chapter,
        tags: autoDetectMedicalTags(chapter.content + ' ' + chapter.title),
      }));

      // Extract year from published date
      let publishedYear = new Date().getFullYear();
      if (parsed.publishedDate) {
        const yearMatch = parsed.publishedDate.match(/\d{4}/);
        if (yearMatch) {
          publishedYear = parseInt(yearMatch[0], 10);
        }
      }

      setParsedData(parsed);
      setBookData(prev => ({
        ...prev,
        title: parsed.title,
        authors: parsed.authors,
        publisher: parsed.publisher,
        isbn: parsed.isbn,
        description: parsed.description,
        publishedYear,
      }));
      setChapters(chaptersWithTags);
      
      // Collect all unique tags from chapters
      const allChapterTags = chaptersWithTags.flatMap(ch => ch.tags);
      setSelectedTags([...new Set(allChapterTags)]);

      setParseProgress(100);
      setIsParsing(false);
      setActiveTab('metadata');

      // Log content lengths for debugging
      const contentLengths = chaptersWithTags.map(ch => ch.content.length);
      console.log(`Parsed ${chaptersWithTags.length} chapters with content lengths:`, contentLengths);
      console.log(`Total content: ${contentLengths.reduce((a, b) => a + b, 0)} characters`);

      toast({
        title: "EPUB Parsed Successfully",
        description: `Extracted ${parsed.tableOfContents.length} chapters from "${parsed.title}". Total content: ${contentLengths.reduce((a, b) => a + b, 0).toLocaleString()} characters.`,
      });
    } catch (error) {
      console.error('EPUB parsing error:', error);
      setIsParsing(false);
      setParseProgress(0);
      
      toast({
        title: "Parsing Error",
        description: "Failed to parse EPUB file. Please ensure it's a valid EPUB format.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // PDF parsing using AI-powered edge function
  const parsePdf = useCallback(async (file: File) => {
    setIsParsing(true);
    setParseProgress(10);

    try {
      const progressInterval = setInterval(() => {
        setParseProgress(prev => Math.min(prev + 2, 45));
      }, 500);

      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const pdfBase64 = btoa(binary);

      setParseProgress(20);

      // Phase 1: Call parse-pdf for metadata extraction
      const { data, error } = await supabase.functions.invoke('parse-pdf', {
        body: { pdfBase64, fileName: file.name },
      });

      clearInterval(progressInterval);
      setParseProgress(50);

      if (error) throw error;
      if (!data || !data.title) throw new Error('Invalid response from PDF parser');

      // Map AI-extracted chapters (initially with summaries only)
      const extractedChapters: ParsedChapter[] = (data.chapters || []).map((ch: { title: string; pageNumber?: number; contentSummary?: string }, idx: number) => ({
        id: `ch-pdf-${Date.now()}-${idx + 1}`,
        title: ch.title,
        content: ch.contentSummary || '',
        pageNumber: ch.pageNumber || idx + 1,
        href: '',
        tags: autoDetectMedicalTags(ch.title + ' ' + (ch.contentSummary || '')),
      }));

      // If no chapters extracted, add at least one
      if (extractedChapters.length === 0) {
        extractedChapters.push({
          id: `ch-pdf-${Date.now()}-1`,
          title: 'Full Document',
          content: data.description || '',
          pageNumber: 1,
          href: '',
          tags: data.detectedTags || [],
        });
      }

      // Phase 2: Extract full text for each chapter
      setParseProgress(55);
      const progressInterval2 = setInterval(() => {
        setParseProgress(prev => Math.min(prev + 2, 90));
      }, 800);

      try {
        const { data: textData, error: textError } = await supabase.functions.invoke('extract-pdf-text', {
          body: {
            pdfBase64,
            chapters: extractedChapters.map(ch => ({ title: ch.title, pageNumber: ch.pageNumber })),
          },
        });

        clearInterval(progressInterval2);

        if (!textError && textData?.chapters) {
          // Merge full text back into chapters
          for (const extracted of textData.chapters) {
            const idx = extracted.chapterIndex;
            if (idx >= 0 && idx < extractedChapters.length && extracted.fullText) {
              extractedChapters[idx].content = extracted.fullText;
            }
          }
          console.log('Full text extraction complete for', textData.chapters.length, 'chapters');
        } else {
          console.warn('Full text extraction failed, using summaries:', textError);
        }
      } catch (extractErr) {
        clearInterval(progressInterval2);
        console.warn('Full text extraction failed, using summaries:', extractErr);
      }

      setParsedData({
        title: data.title,
        authors: data.authors?.length ? data.authors : [''],
        publisher: data.publisher || '',
        isbn: data.isbn || '',
        description: data.description || '',
        language: 'en',
        publishedDate: data.publishedYear ? `${data.publishedYear}` : new Date().toISOString().split('T')[0],
        tableOfContents: extractedChapters,
      });

      setBookData(prev => ({
        ...prev,
        title: data.title,
        subtitle: data.subtitle || '',
        authors: data.authors?.length ? data.authors : [''],
        publisher: data.publisher || '',
        isbn: data.isbn || '',
        description: data.description || '',
        publishedYear: data.publishedYear || new Date().getFullYear(),
        edition: data.edition || '',
        specialty: data.specialty || '',
      }));

      setChapters(extractedChapters);

      const allTags = [...new Set([
        ...(data.detectedTags || []),
        ...extractedChapters.flatMap((ch: ParsedChapter) => ch.tags),
      ])];
      setSelectedTags(allTags);

      setParseProgress(100);
      setIsParsing(false);
      setActiveTab('metadata');

      const totalContent = extractedChapters.reduce((sum, ch) => sum + ch.content.length, 0);
      toast({
        title: "PDF Parsed Successfully",
        description: `Extracted ${extractedChapters.length} sections with ${totalContent.toLocaleString()} characters of content from "${data.title}".`,
      });
    } catch (error) {
      console.error('PDF parsing error:', error);
      setIsParsing(false);
      setParseProgress(0);

      // Fallback to manual entry
      const titleFromName = file.name.replace('.pdf', '').replace(/[-_]/g, ' ');
      setBookData(prev => ({ ...prev, title: titleFromName }));
      setParsedData({
        title: titleFromName, authors: [''], publisher: '', isbn: '',
        description: '', language: 'en', publishedDate: new Date().toISOString().split('T')[0],
        tableOfContents: [],
      });
      setChapters([{
        id: `ch-pdf-${Date.now()}-1`, title: 'Full Document',
        content: '', pageNumber: 1, href: '', tags: [],
      }]);
      setActiveTab('metadata');

      toast({
        title: "Auto-Parse Failed",
        description: "AI extraction failed. You can fill in metadata manually or retry.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isEpub = file.name.endsWith('.epub');
    const isPdf = file.name.endsWith('.pdf');
    
    if (!isEpub && !isPdf) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an EPUB (.epub) or PDF (.pdf) file",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsUploading(false);

    if (isEpub) {
      await parseEpub(file);
    } else {
      await parsePdf(file);
    }
  }, [parseEpub, parsePdf, toast]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const isEpub = file.name.endsWith('.epub');
    const isPdf = file.name.endsWith('.pdf');
    
    if (!isEpub && !isPdf) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an EPUB (.epub) or PDF (.pdf) file",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsUploading(false);
    
    if (isEpub) {
      await parseEpub(file);
    } else {
      await parsePdf(file);
    }
  }, [parseEpub, parsePdf, toast]);

  const handleAddAuthor = () => {
    setBookData(prev => ({
      ...prev,
      authors: [...prev.authors, ''],
    }));
  };

  const handleRemoveAuthor = (index: number) => {
    setBookData(prev => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index),
    }));
  };

  const handleAuthorChange = (index: number, value: string) => {
    setBookData(prev => ({
      ...prev,
      authors: prev.authors.map((a, i) => i === index ? value : a),
    }));
  };

  const handleChapterTagToggle = (chapterIndex: number, tagId: string) => {
    setChapters(prev => prev.map((chapter, i) => {
      if (i !== chapterIndex) return chapter;
      const hasTag = chapter.tags.includes(tagId);
      return {
        ...chapter,
        tags: hasTag 
          ? chapter.tags.filter(t => t !== tagId)
          : [...chapter.tags, tagId],
      };
    }));
  };

  const handleAutoTagChapter = (chapterIndex: number) => {
    setChapters(prev => prev.map((chapter, i) => {
      if (i !== chapterIndex) return chapter;
      const detectedTags = autoDetectMedicalTags(chapter.content + ' ' + chapter.title);
      return {
        ...chapter,
        tags: [...new Set([...chapter.tags, ...detectedTags])],
      };
    }));
    
    toast({
      title: "Tags Auto-Detected",
      description: "Medical tags have been automatically added based on content.",
    });
  };

  // Use Gemini AI (via Supabase function) to generate a concise book description
  const handleGenerateDescriptionWithAI = useCallback(async () => {
    if (!parsedData || chapters.length === 0) {
      toast({
        title: "Not Enough Content",
        description: "Please upload and parse an EPUB file first so we can analyze its chapters.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingDescription(true);

    try {
      // Concatenate the first few chapters as context, but keep within a safe length
      const combinedContent = chapters
        .slice(0, 5)
        .map((ch) => ch.content)
        .join('\n\n')
        .slice(0, 8000);

      const { data, error } = await supabase.functions.invoke('gemini-ai', {
        body: {
          prompt: `You are helping create a bookstore-style description for a medical EPUB textbook.
Book title: "${parsedData.title}"
Authors: ${parsedData.authors.join(', ')}
Publisher: ${parsedData.publisher || 'Unknown'}

Write a concise 2–4 sentence description suitable for a product detail page.
Focus on what the book covers (specialties, conditions, procedures), who it is for (clinicians, residents, students), and why it is useful.
Keep the tone professional and clear. Do not include headings, bullet points, or markdown — return plain text only.`,
          chapterContent: combinedContent,
          chapterTitle: 'Book overview',
          bookTitle: parsedData.title,
          type: 'summary',
        },
      });

      if (error) {
        throw error;
      }

      const aiDescription = (data?.content as string | undefined)?.trim();
      if (!aiDescription) {
        throw new Error('Empty AI description');
      }

      setBookData((prev) => ({
        ...prev,
        description: aiDescription,
      }));

      toast({
        title: "Description Generated",
        description: "AI has created a description. You can edit it before saving.",
      });
    } catch (err) {
      console.error('AI description generation failed:', err);
      toast({
        title: "AI Error",
        description: "Failed to generate description from the book content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  }, [chapters, parsedData, toast]);

  // Use AI to enhance chapter titles and organization
  const handleEnhanceChaptersWithAI = useCallback(async () => {
    if (!parsedData || chapters.length === 0) {
      toast({
        title: "No Chapters",
        description: "Please upload and parse an EPUB file first.",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancingChapters(true);

    try {
      const enhanced = await enhanceChaptersWithAI(chapters, parsedData.title, supabase);
      setChapters(enhanced);
      
      toast({
        title: "Chapters Enhanced",
        description: `AI has improved ${enhanced.length} chapter titles based on their content.`,
      });
    } catch (err) {
      console.error('AI chapter enhancement failed:', err);
      toast({
        title: "Enhancement Failed",
        description: "Could not enhance chapters with AI. Using original chapters.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancingChapters(false);
    }
  }, [chapters, parsedData, toast]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveBook = async () => {
    // Validate required fields
    if (!bookData.title || !bookData.specialty) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in title and specialty.",
        variant: "destructive",
      });
      return;
    }

    // Validate chapters have content (relaxed for PDFs which have placeholder content)
    const isPdfFile = uploadedFile?.name.endsWith('.pdf');
    const validChapters = chapters.filter(ch => ch.content && ch.content.trim().length > 0);
    if (validChapters.length === 0 && !isPdfFile) {
      toast({
        title: "No Chapter Content",
        description: "Please ensure the file was parsed successfully and has chapters.",
        variant: "destructive",
      });
      return;
    }
    const chaptersToSave = validChapters.length > 0 ? validChapters : chapters;

    setIsSaving(true);

    try {
      // 1. Upload file to storage bucket if we have it
      let filePath: string | null = null;
      if (uploadedFile) {
        const fileExt = uploadedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${uploadedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('book-files')
          .upload(filePath, uploadedFile, {
            contentType: uploadedFile.name.endsWith('.pdf') ? 'application/pdf' : (uploadedFile.type || 'application/epub+zip'),
            upsert: false,
          });

        if (uploadError) {
          console.warn('Storage upload failed (continuing without file):', uploadError);
          filePath = null;
        }
      }

      // 2. Insert book record into database
      const { data: bookRecord, error: bookError } = await supabase
        .from('books')
        .insert({
          title: bookData.title,
          subtitle: bookData.subtitle || null,
          authors: bookData.authors.filter(a => a.trim()),
          publisher: bookData.publisher || null,
          isbn: bookData.isbn || null,
          published_year: bookData.publishedYear,
          edition: bookData.edition || null,
          cover_color: bookData.coverColor,
          file_path: filePath,
          file_type: uploadedFile?.name.endsWith('.pdf') ? 'pdf' : 'epub',
          description: bookData.description || '',
          specialty: bookData.specialty,
          tags: selectedTags,
          chapter_count: validChapters.length,
        })
        .select()
        .single();

      if (bookError) {
        // If DB insert fails, still add to local context as fallback
        console.error('DB insert failed, using local fallback:', bookError);
        const fallbackBook: EpubBook = {
          id: `book-${Date.now()}`,
          title: bookData.title,
          subtitle: bookData.subtitle,
          authors: bookData.authors.filter(a => a.trim()),
          publisher: bookData.publisher,
          isbn: bookData.isbn,
          publishedYear: bookData.publishedYear,
          edition: bookData.edition,
          coverColor: bookData.coverColor,
          price: bookData.price,
          description: bookData.description,
          specialty: bookData.specialty,
          accessCount: 0,
          searchCount: 0,
          tags: selectedTags,
          tableOfContents: validChapters.map(ch => ({
            id: ch.id,
            title: ch.title,
            content: ch.content,
            pageNumber: ch.pageNumber,
            tags: ch.tags,
          })),
        };
        addBook(fallbackBook);
        
        toast({
          title: "Book Saved Locally",
          description: `"${bookData.title}" saved to session (database unavailable). ${bookError.message}`,
        });
      } else {
        // 3. Insert chapters into database
        const chapterInserts = validChapters.map((ch, idx) => ({
          book_id: bookRecord.id,
          chapter_key: ch.id,
          title: ch.title,
          content: ch.content,
          page_number: ch.pageNumber,
          tags: ch.tags,
          sort_order: idx,
        }));

        const { error: chapError } = await supabase
          .from('book_chapters')
          .insert(chapterInserts);

        if (chapError) {
          console.error('Chapter insert error:', chapError);
        }

        // Also add to local context for immediate availability
        const newBook: EpubBook = {
          id: bookRecord.id,
          title: bookData.title,
          subtitle: bookData.subtitle,
          authors: bookData.authors.filter(a => a.trim()),
          publisher: bookData.publisher,
          isbn: bookData.isbn,
          publishedYear: bookData.publishedYear,
          edition: bookData.edition,
          coverColor: bookData.coverColor,
          price: bookData.price,
          description: bookData.description,
          specialty: bookData.specialty,
          accessCount: 0,
          searchCount: 0,
          tags: selectedTags,
          tableOfContents: validChapters.map(ch => ({
            id: ch.id,
            title: ch.title,
            content: ch.content,
            pageNumber: ch.pageNumber,
            tags: ch.tags,
          })),
        };
        addBook(newBook);

        toast({
          title: "🎉 Book Saved to Database!",
          description: `"${bookData.title}" persisted with ${validChapters.length} chapters${filePath ? ' and EPUB file stored' : ''}.`,
        });
      }

      // Reset form
      setUploadedFile(null);
      setParsedData(null);
      setBookData({
        title: '',
        subtitle: '',
        authors: [''],
        publisher: '',
        isbn: '',
        publishedYear: new Date().getFullYear(),
        edition: '',
        description: '',
        specialty: '',
        price: 0,
        coverColor: COVER_COLORS[0].value,
      });
      setChapters([]);
      setSelectedTags([]);
      setActiveTab('upload');

      navigate('/library');
    } catch (err) {
      console.error('Save error:', err);
      toast({
        title: "Save Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Settings className="h-6 w-6 text-accent" />
                Admin: EPUB Upload
              </h1>
              <p className="text-muted-foreground mt-1">
                Upload and configure new medical books for the library • Current: {totalBooks} titles
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/library')}>
              Back to Library
            </Button>
          </div>
        </div>
      </section>

      <main className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              1. Upload EPUB
            </TabsTrigger>
            <TabsTrigger value="metadata" className="gap-2" disabled={!parsedData}>
              <FileText className="h-4 w-4" />
              2. Metadata
            </TabsTrigger>
            <TabsTrigger value="chapters" className="gap-2" disabled={!parsedData}>
              <Book className="h-4 w-4" />
              3. Chapters & Tags
            </TabsTrigger>
            <TabsTrigger value="review" className="gap-2" disabled={!parsedData}>
              <Check className="h-4 w-4" />
              4. Review & Save
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Upload EPUB File</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className={`
                    border-2 border-dashed rounded-xl p-12 text-center transition-colors
                    ${isUploading || isParsing 
                      ? 'border-accent bg-accent/5' 
                      : 'border-border hover:border-accent hover:bg-muted/50 cursor-pointer'}
                  `}
                >
                  {isUploading ? (
                    <div className="space-y-4">
                      <Loader2 className="h-12 w-12 text-accent mx-auto animate-spin" />
                      <p className="text-lg font-medium">Uploading file...</p>
                    </div>
                  ) : isParsing ? (
                    <div className="space-y-4">
                      <FileText className="h-12 w-12 text-accent mx-auto" />
                      <p className="text-lg font-medium">Parsing file...</p>
                      <Progress value={parseProgress} className="max-w-xs mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Extracting metadata, chapters, and content
                      </p>
                    </div>
                  ) : uploadedFile ? (
                    <div className="space-y-4">
                      <Check className="h-12 w-12 text-success mx-auto" />
                      <p className="text-lg font-medium text-success">File Uploaded!</p>
                      <p className="text-sm text-muted-foreground">{uploadedFile.name}</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">
                        Drag & drop your EPUB or PDF file here
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Supports .epub and .pdf formats
                      </p>
                      <input
                        type="file"
                        accept=".epub,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="epub-upload"
                      />
                      <label htmlFor="epub-upload">
                        <Button asChild variant="outline">
                          <span>Select File</span>
                        </Button>
                      </label>
                    </>
                  )}
                </div>

                <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    Content Processing Features
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ <strong>EPUB:</strong> Extracts metadata, TOC, and chapter text automatically</li>
                    <li>✓ <strong>PDF:</strong> Upload with manual metadata entry</li>
                    <li>✓ Auto-detects medical tags from content</li>
                    <li>✓ Stores files securely in repository</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metadata Tab */}
          <TabsContent value="metadata">
            <div className="max-w-3xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Book Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={bookData.title}
                        onChange={(e) => setBookData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Book title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        value={bookData.subtitle}
                        onChange={(e) => setBookData(prev => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="e.g., 21st Edition"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Authors</Label>
                    {bookData.authors.map((author, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={author}
                          onChange={(e) => handleAuthorChange(index, e.target.value)}
                          placeholder="Author name"
                        />
                        {bookData.authors.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveAuthor(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={handleAddAuthor}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Author
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="publisher">Publisher</Label>
                      <Input
                        id="publisher"
                        value={bookData.publisher}
                        onChange={(e) => setBookData(prev => ({ ...prev, publisher: e.target.value }))}
                        placeholder="Publisher name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input
                        id="isbn"
                        value={bookData.isbn}
                        onChange={(e) => setBookData(prev => ({ ...prev, isbn: e.target.value }))}
                        placeholder="978-XXXXXXXXXX"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Published Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={bookData.publishedYear}
                        onChange={(e) => setBookData(prev => ({ ...prev, publishedYear: parseInt(e.target.value) || 2024 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edition">Edition</Label>
                      <Input
                        id="edition"
                        value={bookData.edition}
                        onChange={(e) => setBookData(prev => ({ ...prev, edition: e.target.value }))}
                        placeholder="e.g., 5th"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (USD) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={bookData.price || ''}
                        onChange={(e) => setBookData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty *</Label>
                    <Select
                      value={bookData.specialty}
                      onValueChange={(value) => setBookData(prev => ({ ...prev, specialty: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map(specialty => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverColor">Cover Color</Label>
                    <Select
                      value={bookData.coverColor}
                      onValueChange={(value) => setBookData(prev => ({ ...prev, coverColor: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COVER_COLORS.map(color => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: color.value }}
                              />
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={bookData.description}
                      onChange={(e) => setBookData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Book description..."
                      rows={4}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs"
                        disabled={isGeneratingDescription || !parsedData}
                        onClick={handleGenerateDescriptionWithAI}
                      >
                        {isGeneratingDescription ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        <span>Generate with AI</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('upload')}>
                  Back
                </Button>
                <Button onClick={() => setActiveTab('chapters')}>
                  Next: Chapters & Tags
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Chapters Tab */}
          <TabsContent value="chapters">
            <div className="max-w-4xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Chapters & Medical Tags</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{chapters.length} chapters</Badge>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs"
                        disabled={isEnhancingChapters || chapters.length === 0}
                        onClick={handleEnhanceChaptersWithAI}
                      >
                        {isEnhancingChapters ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        <span>Enhance with AI</span>
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {chapters.map((chapter, index) => (
                        <Card key={chapter.id} className="p-4">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">{chapter.title}</h4>
                              <p className="text-sm text-muted-foreground">Page {chapter.pageNumber}</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAutoTagChapter(index)}
                              className="flex-shrink-0"
                            >
                              <Sparkles className="h-4 w-4 mr-1" />
                              Auto-Tag
                            </Button>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {chapter.content.slice(0, 200)}...
                          </p>
                          
                          <div className="space-y-2">
                            <Label className="text-xs">Medical Tags:</Label>
                            <div className="flex flex-wrap gap-1.5">
                              {medicalTags.map(tag => {
                                const isSelected = chapter.tags.includes(tag.id);
                                return (
                                  <button
                                    key={tag.id}
                                    onClick={() => handleChapterTagToggle(index, tag.id)}
                                    className={`
                                      px-2 py-0.5 rounded-full text-xs font-medium transition-colors
                                      ${isSelected 
                                        ? 'bg-accent text-accent-foreground' 
                                        : 'bg-muted text-muted-foreground hover:bg-accent/20'}
                                    `}
                                  >
                                    {tag.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('metadata')}>
                  Back
                </Button>
                <Button onClick={() => setActiveTab('review')}>
                  Next: Review & Save
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review">
            <div className="max-w-3xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review Book Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Book Preview */}
                  <div className="flex gap-6 p-4 rounded-lg bg-muted/50">
                    <div 
                      className="w-24 h-32 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: bookData.coverColor }}
                    >
                      <Book className="h-10 w-10 text-white/30" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{bookData.title || 'Untitled'}</h3>
                      {bookData.subtitle && (
                        <p className="text-muted-foreground">{bookData.subtitle}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        {bookData.authors.filter(a => a).join(', ') || 'No authors'}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <Badge variant="secondary">{bookData.specialty || 'No specialty'}</Badge>
                        <span className="text-lg font-bold text-accent">
                          ${bookData.price || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-secondary/50 text-center">
                      <p className="text-2xl font-bold text-foreground">{chapters.length}</p>
                      <p className="text-sm text-muted-foreground">Chapters</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50 text-center">
                      <p className="text-2xl font-bold text-foreground">
                        {new Set(chapters.flatMap(c => c.tags)).size}
                      </p>
                      <p className="text-sm text-muted-foreground">Unique Tags</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50 text-center">
                      <p className="text-2xl font-bold text-foreground">{bookData.publishedYear}</p>
                      <p className="text-sm text-muted-foreground">Published</p>
                    </div>
                  </div>

                  {/* Metadata Summary */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Publisher</span>
                      <span className="font-medium">{bookData.publisher || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">ISBN</span>
                      <span className="font-medium">{bookData.isbn || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Edition</span>
                      <span className="font-medium">{bookData.edition || 'Not specified'}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {bookData.description && (
                    <div>
                      <Label className="text-muted-foreground">Description</Label>
                      <p className="mt-1 text-sm">{bookData.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('chapters')}>
                  Back
                </Button>
                <Button variant="cta" size="lg" onClick={handleSaveBook} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? 'Saving to Database...' : 'Save Book to Library'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
