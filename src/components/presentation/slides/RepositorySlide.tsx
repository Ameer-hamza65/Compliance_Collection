import { motion } from 'framer-motion';
import { SlideLayout } from '../SlideLayout';
import { Database, HardDrive, Lock, BookOpen } from 'lucide-react';

const archCards = [
  { icon: HardDrive, title: 'Storage Layer', desc: 'Private RLS-protected book-files bucket for EPUB3 & PDF binary storage', stat: 'book-files' },
  { icon: Database, title: 'Metadata Layer', desc: 'Structured books table with ISBN, authors, publisher, specialty, tags', stat: '12+ fields' },
  { icon: Lock, title: 'Access Control', desc: 'Row-Level Security isolates data per enterprise tenant', stat: 'Per-tenant RLS' },
  { icon: BookOpen, title: 'Content Layer', desc: 'Chapter-level content with tags, page numbers, sort order', stat: 'book_chapters' },
];

export function RepositorySlide() {
  return (
    <SlideLayout className="bg-[hsl(222,47%,6%)] text-[hsl(210,40%,92%)]">
      <div className="relative z-10 flex h-full">
        {/* Left panel */}
        <div className="w-[45%] flex flex-col justify-center px-20 py-16">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-[14px] font-bold tracking-[0.3em] uppercase text-[hsl(174,72%,46%)] mb-4 block">Pillar 1</span>
            <h2 className="text-[64px] font-black leading-[1.05] tracking-tight mb-6">
              Repository<br />Architecture
            </h2>
            <p className="text-[22px] text-[hsl(215,20%,55%)] leading-relaxed max-w-[500px]">
              Where and how are EPUB3 and PDF files stored? A four-layer architecture ensures security, structure, and scalability.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-10 rounded-xl border border-[hsl(220,20%,16%)] bg-[hsl(222,40%,9%)] p-6"
          >
            <div className="text-[14px] font-bold text-[hsl(215,20%,45%)] mb-3 tracking-wider uppercase">Database Tables</div>
            <div className="space-y-2 font-mono text-[16px]">
              <div className="flex items-center gap-3"><span className="text-[hsl(174,72%,46%)]">→</span> <span className="text-[hsl(38,95%,55%)]">books</span> <span className="text-[hsl(215,20%,45%)]">— Title, ISBN, specialty, file_path</span></div>
              <div className="flex items-center gap-3"><span className="text-[hsl(174,72%,46%)]">→</span> <span className="text-[hsl(38,95%,55%)]">book_chapters</span> <span className="text-[hsl(215,20%,45%)]">— Content, tags, sort order</span></div>
              <div className="flex items-center gap-3"><span className="text-[hsl(174,72%,46%)]">→</span> <span className="text-[hsl(38,95%,55%)]">book-files</span> <span className="text-[hsl(215,20%,45%)]">— Binary EPUB/PDF storage</span></div>
            </div>
          </motion.div>
        </div>

        {/* Right panel — architecture cards */}
        <div className="w-[55%] flex items-center px-10">
          <div className="grid grid-cols-2 gap-6 w-full">
            {archCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
                className="rounded-2xl border border-[hsl(220,20%,16%)] bg-gradient-to-br from-[hsl(222,40%,10%)] to-[hsl(222,40%,8%)] p-8 hover:border-[hsl(174,72%,46%/0.3)] transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-xl bg-[hsl(174,72%,46%/0.1)] flex items-center justify-center mb-5">
                  <card.icon className="w-6 h-6 text-[hsl(174,72%,46%)]" />
                </div>
                <h3 className="text-[24px] font-bold mb-2">{card.title}</h3>
                <p className="text-[16px] text-[hsl(215,20%,55%)] leading-relaxed mb-4">{card.desc}</p>
                <div className="text-[14px] font-mono font-bold text-[hsl(174,72%,46%)]">{card.stat}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Flow arrow at bottom */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-12 left-20 right-20 flex items-center gap-4"
      >
        {['Upload', 'Storage', 'Metadata', 'Access Control', 'Catalog'].map((step, i) => (
          <div key={step} className="flex items-center gap-4 flex-1">
            <div className="text-[14px] font-bold tracking-wider uppercase px-4 py-2 rounded-lg border border-[hsl(220,20%,16%)] bg-[hsl(222,40%,9%)] text-center w-full">{step}</div>
            {i < 4 && <span className="text-[hsl(174,72%,46%)] text-[20px] flex-shrink-0">→</span>}
          </div>
        ))}
      </motion.div>
    </SlideLayout>
  );
}
