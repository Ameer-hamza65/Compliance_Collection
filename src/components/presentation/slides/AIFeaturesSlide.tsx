import { motion } from 'framer-motion';
import { SlideLayout } from '../SlideLayout';
import { Brain } from 'lucide-react';

const features = [
  { title: 'Chapter Summaries', desc: 'AI generates concise summaries of each chapter for quick scanning', icon: '📝', color: 'hsl(262,60%,65%)' },
  { title: 'Free-Form Q&A', desc: 'Ask any question — AI answers using only chapter content, never the open web', icon: '💬', color: 'hsl(174,72%,46%)' },
  { title: 'Metadata Extraction', desc: 'Gemini AI auto-extracts title, authors, ISBN, specialty, tags from uploaded files', icon: '🔍', color: 'hsl(38,95%,55%)' },
  { title: 'Content Guardrails', desc: 'All responses strictly scoped to repository content — no hallucinated external data', icon: '🛡️', color: 'hsl(350,65%,55%)' },
];

const stats = [
  { label: 'Model', value: 'Gemini 2.5 Flash' },
  { label: 'Avg Response', value: '<3s' },
  { label: 'Query Logging', value: '100%' },
  { label: 'Scope', value: 'Chapter-only' },
];

export function AIFeaturesSlide() {
  return (
    <SlideLayout className="bg-[hsl(222,47%,6%)] text-[hsl(210,40%,92%)]">
      <div className="relative z-10 flex flex-col h-full px-24 py-14">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-5 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(262,60%,65%/0.12)] flex items-center justify-center">
            <Brain className="w-7 h-7 text-[hsl(262,60%,65%)]" />
          </div>
          <div>
            <h2 className="text-[56px] font-black tracking-tight">AI-Powered Features</h2>
            <p className="text-[20px] text-[hsl(215,20%,55%)]">Gemini AI — scoped to your content, never the open web</p>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="flex-1 rounded-xl border border-[hsl(220,20%,14%)] bg-[hsl(222,40%,9%)] px-5 py-4 text-center">
              <div className="text-[24px] font-black text-[hsl(262,60%,65%)]">{s.value}</div>
              <div className="text-[13px] text-[hsl(215,20%,50%)] mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Feature grid */}
        <div className="flex-1 grid grid-cols-2 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="rounded-2xl border border-[hsl(220,20%,14%)] bg-[hsl(222,40%,9%)] p-8 flex flex-col justify-center"
              style={{ borderTopWidth: 3, borderTopColor: f.color }}
            >
              <div className="text-[40px] mb-3">{f.icon}</div>
              <div className="text-[22px] font-bold mb-2">{f.title}</div>
              <div className="text-[16px] text-[hsl(215,20%,50%)] leading-relaxed">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideLayout>
  );
}
