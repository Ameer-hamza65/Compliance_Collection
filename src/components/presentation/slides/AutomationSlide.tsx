import { motion } from 'framer-motion';
import { SlideLayout } from '../SlideLayout';
import { Upload, Brain, Edit, Tag, Rocket } from 'lucide-react';

const steps = [
  { icon: Upload, title: 'File Upload', desc: 'Drag-and-drop EPUB or PDF', num: '01', color: 'hsl(174,72%,46%)' },
  { icon: Brain, title: 'AI Extraction', desc: 'Gemini AI extracts metadata, chapters, tags', num: '02', color: 'hsl(280,60%,55%)' },
  { icon: Edit, title: 'Review & Edit', desc: 'Admin reviews AI-populated fields', num: '03', color: 'hsl(38,95%,55%)' },
  { icon: Tag, title: 'Tag Assignment', desc: 'Auto-detected medical compliance tags', num: '04', color: 'hsl(152,69%,40%)' },
  { icon: Rocket, title: 'Publish', desc: 'Book + chapters saved, available in catalog', num: '05', color: 'hsl(0,72%,55%)' },
];

export function AutomationSlide() {
  return (
    <SlideLayout className="bg-[hsl(222,47%,6%)] text-[hsl(210,40%,92%)]">
      <div className="relative z-10 flex flex-col h-full px-24 py-16">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <span className="text-[14px] font-bold tracking-[0.3em] uppercase text-[hsl(38,95%,55%)] mb-3 block">Pillar 4</span>
          <h2 className="text-[64px] font-black tracking-tight">Automation Workflow</h2>
          <p className="text-[22px] text-[hsl(215,20%,55%)] mt-3 max-w-[700px]">AI-powered content ingestion pipeline — from file upload to searchable catalog in minutes.</p>
          <div className="w-24 h-1.5 rounded-full bg-[hsl(38,95%,55%)] mt-5" />
        </motion.div>

        {/* Pipeline flow */}
        <div className="flex-1 flex items-center mt-8">
          <div className="flex items-start gap-4 w-full">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.15, duration: 0.6, type: 'spring', bounce: 0.3 }}
                className="flex-1 relative"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.7 + i * 0.15, duration: 0.5 }}
                    className="absolute top-[52px] right-[-16px] w-[32px] h-[2px] origin-left"
                    style={{ background: `linear-gradient(90deg, ${step.color}, ${steps[i + 1].color})` }}
                  />
                )}
                
                <div className="rounded-2xl border border-[hsl(220,20%,16%)] bg-gradient-to-b from-[hsl(222,40%,10%)] to-[hsl(222,40%,8%)] p-7 text-center hover:border-[hsl(174,72%,46%/0.3)] transition-all duration-500 h-full">
                  <motion.div
                    className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: `${step.color.replace(')', '/0.12)')}` }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <step.icon className="w-8 h-8" style={{ color: step.color }} />
                  </motion.div>
                  <div className="text-[32px] font-black mb-2" style={{ color: step.color }}>{step.num}</div>
                  <h3 className="text-[22px] font-bold mb-2">{step.title}</h3>
                  <p className="text-[16px] text-[hsl(215,20%,55%)] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Fallback note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-4 px-6 py-4 rounded-xl border border-[hsl(38,95%,55%/0.2)] bg-[hsl(38,95%,55%/0.05)] flex items-center gap-4"
        >
          <span className="text-[hsl(38,95%,55%)] text-[20px]">⚡</span>
          <span className="text-[18px] text-[hsl(215,20%,55%)]">
            <strong className="text-[hsl(38,95%,55%)]">Graceful Fallback:</strong> If AI extraction fails, system falls back to manual metadata entry — no upload is ever blocked.
          </span>
        </motion.div>
      </div>
    </SlideLayout>
  );
}
