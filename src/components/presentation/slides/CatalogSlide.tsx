import { motion } from 'framer-motion';
import { SlideLayout } from '../SlideLayout';
import { Search, Brain, BookOpen, ShieldCheck } from 'lucide-react';

export function CatalogSlide() {
  return (
    <SlideLayout className="bg-[hsl(222,47%,6%)] text-[hsl(210,40%,92%)]">
      <div className="relative z-10 flex h-full">
        {/* Left */}
        <div className="w-[45%] flex flex-col justify-center px-20">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-[14px] font-bold tracking-[0.3em] uppercase text-[hsl(280,60%,55%)] mb-3 block">Pillar 5</span>
            <h2 className="text-[60px] font-black leading-tight tracking-tight mb-6">Catalog &<br />Search</h2>
            <p className="text-[20px] text-[hsl(215,20%,55%)] leading-relaxed">
              Weighted search across titles, authors, and tags with AI-powered chapter-scoped Q&A.
            </p>
          </motion.div>

          {/* Search scoring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 space-y-4"
          >
            <div className="text-[14px] font-bold tracking-wider uppercase text-[hsl(215,20%,45%)]">Search Scoring</div>
            {[
              { label: 'Title Match', points: 30, width: '100%', color: 'hsl(280,60%,55%)' },
              { label: 'Tag Match', points: 20, width: '66%', color: 'hsl(174,72%,46%)' },
              { label: 'Content Keyword', points: 5, width: '17%', color: 'hsl(38,95%,55%)' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.12 }}
              >
                <div className="flex justify-between text-[16px] mb-1.5">
                  <span className="font-medium">{s.label}</span>
                  <span className="font-mono font-bold" style={{ color: s.color }}>{s.points} pts</span>
                </div>
                <div className="h-3 rounded-full bg-[hsl(220,20%,12%)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: s.color, width: 0 }}
                    animate={{ width: s.width }}
                    transition={{ delay: 0.9 + i * 0.12, duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right — AI features */}
        <div className="flex-1 flex flex-col justify-center pr-20 gap-6">
          {[
            { icon: Search, title: 'Library Catalog', desc: 'Grid of book cards with cover, title, authors, specialty badges. Real-time search with weighted scoring.', color: 'hsl(280,60%,55%)' },
            { icon: Brain, title: 'AI Chapter Q&A', desc: 'Chapter-scoped summaries, key compliance points, and free-form Q&A — restricted to internal content only.', color: 'hsl(174,72%,46%)' },
            { icon: BookOpen, title: 'Full Reader', desc: 'Chapter reader with table of contents sidebar and integrated AI panel for contextual analysis.', color: 'hsl(38,95%,55%)' },
            { icon: ShieldCheck, title: 'AI Guardrails', desc: 'No open-web queries. All AI responses cite repository titles only. Query caps enforced per tier.', color: 'hsl(152,69%,40%)' },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.15, duration: 0.6 }}
              className="flex gap-5 p-6 rounded-xl border border-[hsl(220,20%,16%)] bg-[hsl(222,40%,9%)] hover:border-[hsl(174,72%,46%/0.3)] transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${card.color.replace(')', '/0.1)')}` }}>
                <card.icon className="w-6 h-6" style={{ color: card.color }} />
              </div>
              <div>
                <h3 className="text-[22px] font-bold mb-1">{card.title}</h3>
                <p className="text-[16px] text-[hsl(215,20%,55%)] leading-relaxed">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideLayout>
  );
}
