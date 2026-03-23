import { motion } from 'framer-motion';
import { SlideLayout } from '../SlideLayout';
import { BarChart3 } from 'lucide-react';

const metrics = [
  { label: 'Licensed Seats', value: '250', sub: '218 active (87%)', color: 'hsl(174,72%,46%)', pct: 87 },
  { label: 'AI Queries (Month)', value: '1,247', sub: 'Avg 5.7 per user', color: 'hsl(262,60%,65%)', pct: 62 },
  { label: 'Books Accessed', value: '34', sub: 'of 42 in catalog', color: 'hsl(38,95%,55%)', pct: 81 },
  { label: 'Collections Active', value: '5/5', sub: 'All bundles unlocked', color: 'hsl(142,60%,50%)', pct: 100 },
];

const dashWidgets = [
  { title: 'Usage Trends', desc: 'Weekly/monthly access patterns with time-series charts', icon: '📊' },
  { title: 'Top Titles', desc: 'Most accessed books ranked by total views and AI queries', icon: '📚' },
  { title: 'Department Breakdown', desc: 'Usage metrics segmented by department', icon: '🏥' },
  { title: 'Alerts & Warnings', desc: 'Seat utilization alerts at 90% and 100% thresholds', icon: '⚠️' },
];

export function EnterpriseDashSlide() {
  return (
    <SlideLayout className="bg-[hsl(222,47%,6%)] text-[hsl(210,40%,92%)]">
      <div className="relative z-10 flex flex-col h-full px-24 py-14">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(174,72%,46%/0.12)] flex items-center justify-center">
            <BarChart3 className="w-7 h-7 text-[hsl(174,72%,46%)]" />
          </div>
          <div>
            <h2 className="text-[56px] font-black tracking-tight">Enterprise Dashboard</h2>
            <p className="text-[20px] text-[hsl(215,20%,55%)]">Real-time institutional analytics and seat management</p>
          </div>
        </motion.div>

        {/* Metrics row */}
        <div className="flex gap-5 mb-8">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="flex-1 rounded-xl border border-[hsl(220,20%,14%)] bg-[hsl(222,40%,9%)] p-5"
            >
              <div className="text-[13px] text-[hsl(215,20%,50%)] mb-2">{m.label}</div>
              <div className="text-[36px] font-black leading-none mb-1" style={{ color: m.color }}>{m.value}</div>
              <div className="text-[13px] text-[hsl(215,20%,45%)] mb-3">{m.sub}</div>
              <div className="h-2 rounded-full bg-[hsl(220,20%,12%)]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: m.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${m.pct}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dashboard widgets */}
        <div className="flex-1 grid grid-cols-4 gap-5">
          {dashWidgets.map((w, i) => (
            <motion.div
              key={w.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="rounded-xl border border-[hsl(220,20%,14%)] bg-[hsl(222,40%,9%)] p-6 flex flex-col justify-center"
            >
              <div className="text-[36px] mb-3">{w.icon}</div>
              <div className="text-[18px] font-bold mb-2">{w.title}</div>
              <div className="text-[14px] text-[hsl(215,20%,50%)] leading-relaxed">{w.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideLayout>
  );
}
