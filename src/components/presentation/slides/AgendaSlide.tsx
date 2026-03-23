import { motion } from 'framer-motion';
import { SlideLayout } from '../SlideLayout';
import { Database, Shield, FileText, Upload, Search, BarChart3 } from 'lucide-react';

const pillars = [
  { icon: Database, title: 'Repository Architecture', desc: 'Secure EPUB3/PDF storage with RLS-protected buckets', color: 'hsl(174,72%,46%)' },
  { icon: Shield, title: 'Security & Access Control', desc: 'Multi-tenant RLS, tier-gated collections, role-based access', color: 'hsl(152,69%,40%)' },
  { icon: FileText, title: 'Metadata Structure', desc: 'Rich structured metadata: ISBN, publisher, specialty, tags', color: 'hsl(220,70%,55%)' },
  { icon: Upload, title: 'Automation Workflow', desc: 'AI-powered ingestion pipeline with Gemini extraction', color: 'hsl(38,95%,55%)' },
  { icon: Search, title: 'Catalog & Search', desc: 'Weighted search with AI chapter-scoped Q&A', color: 'hsl(280,60%,55%)' },
  { icon: BarChart3, title: 'COUNTER 5.1 Reporting', desc: 'TR_B1, TR_B3 librarian reports with CSV export', color: 'hsl(0,72%,55%)' },
];

export function AgendaSlide() {
  return (
    <SlideLayout className="bg-[hsl(222,47%,6%)] text-[hsl(210,40%,92%)]">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(174,72%,46%) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 flex flex-col h-full px-24 py-20">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <span className="text-[16px] font-semibold tracking-[0.25em] uppercase text-[hsl(174,72%,46%)] mb-3 block">Overview</span>
          <h2 className="text-[72px] font-black tracking-tight">Six Demo Pillars</h2>
          <div className="w-24 h-1.5 rounded-full bg-[hsl(174,72%,46%)] mt-4" />
        </motion.div>

        <div className="grid grid-cols-3 gap-8 mt-16 flex-1">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.12 }}
              className="relative group"
            >
              <div className="rounded-2xl border border-[hsl(220,20%,16%)] bg-[hsl(222,40%,9%)] p-8 h-full transition-all duration-500 hover:border-[hsl(174,72%,46%/0.4)] hover:shadow-[0_0_30px_-10px_hsl(174,72%,46%/0.2)]">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${p.color.replace(')', '/0.12)')}` }}
                >
                  <p.icon className="w-7 h-7" style={{ color: p.color }} />
                </div>
                <div className="text-[14px] font-bold text-[hsl(215,20%,45%)] mb-2 tracking-wider uppercase">Pillar {i + 1}</div>
                <h3 className="text-[26px] font-bold mb-3 leading-tight">{p.title}</h3>
                <p className="text-[18px] text-[hsl(215,20%,55%)] leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideLayout>
  );
}
