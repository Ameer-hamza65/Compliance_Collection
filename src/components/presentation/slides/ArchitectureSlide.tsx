import { motion } from 'framer-motion';
import { SlideLayout } from '../SlideLayout';
import { Layers } from 'lucide-react';

const layers = [
  { name: 'Presentation Layer', desc: 'React + Tailwind responsive UI with framer-motion animations', tech: 'React 18, Vite, TypeScript', color: 'hsl(174,72%,46%)' },
  { name: 'Application Layer', desc: 'Business logic, hooks, context providers, route guards', tech: 'React Router, Context API', color: 'hsl(217,91%,76%)' },
  { name: 'API & Edge Functions', desc: 'Serverless functions for AI processing and PDF parsing', tech: 'Deno Edge Functions', color: 'hsl(38,95%,55%)' },
  { name: 'Database Layer', desc: 'PostgreSQL with Row-Level Security for multi-tenant isolation', tech: 'PostgreSQL 15, RLS', color: 'hsl(142,60%,50%)' },
  { name: 'Storage Layer', desc: 'Secure file storage for EPUB3 and PDF content', tech: 'Object Storage, CDN', color: 'hsl(262,60%,65%)' },
];

export function ArchitectureSlide() {
  return (
    <SlideLayout className="bg-[hsl(222,47%,6%)] text-[hsl(210,40%,92%)]">
      <div className="relative z-10 flex flex-col h-full px-24 py-14">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(217,91%,76%/0.12)] flex items-center justify-center">
            <Layers className="w-7 h-7 text-[hsl(217,91%,76%)]" />
          </div>
          <div>
            <h2 className="text-[56px] font-black tracking-tight">Platform Architecture</h2>
            <p className="text-[20px] text-[hsl(215,20%,55%)]">Full-stack SaaS — five layers, zero vendor lock-in</p>
          </div>
        </motion.div>

        <div className="flex-1 flex gap-10">
          {/* Stack diagram */}
          <div className="flex-1 flex flex-col gap-3">
            {layers.map((layer, i) => (
              <motion.div
                key={layer.name}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex-1 rounded-xl border border-[hsl(220,20%,14%)] bg-[hsl(222,40%,9%)] px-8 flex items-center gap-6"
                style={{ borderLeftWidth: 4, borderLeftColor: layer.color }}
              >
                <div className="text-[44px] font-black" style={{ color: layer.color, opacity: 0.3 }}>{i + 1}</div>
                <div className="flex-1">
                  <div className="text-[20px] font-bold">{layer.name}</div>
                  <div className="text-[15px] text-[hsl(215,20%,50%)]">{layer.desc}</div>
                </div>
                <div className="font-mono text-[13px] px-3 py-1 rounded-lg bg-[hsl(222,47%,6%)] border border-[hsl(220,20%,18%)]" style={{ color: layer.color }}>
                  {layer.tech}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Side stats */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="w-[360px] flex flex-col gap-4">
            {[
              { label: 'Database Tables', value: '14+', color: 'hsl(142,60%,50%)' },
              { label: 'RLS Policies', value: '30+', color: 'hsl(174,72%,46%)' },
              { label: 'Edge Functions', value: '2', color: 'hsl(38,95%,55%)' },
              { label: 'React Components', value: '80+', color: 'hsl(217,91%,76%)' },
              { label: 'Pages / Routes', value: '12', color: 'hsl(262,60%,65%)' },
            ].map((stat, i) => (
              <div key={stat.label} className="flex-1 rounded-xl border border-[hsl(220,20%,14%)] bg-[hsl(222,40%,9%)] px-6 flex items-center justify-between">
                <span className="text-[16px] text-[hsl(215,20%,55%)]">{stat.label}</span>
                <span className="text-[32px] font-black" style={{ color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </SlideLayout>
  );
}
