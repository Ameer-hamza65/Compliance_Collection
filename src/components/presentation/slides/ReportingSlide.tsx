import { motion } from 'framer-motion';
import { SlideLayout } from '../SlideLayout';
import { BarChart3, Download, Activity, ClipboardList } from 'lucide-react';

const reportCards = [
  { icon: BarChart3, title: 'COUNTER 5.1 Reports', items: ['TR_B1 — Book Master Report by Title', 'TR_B3 — Book Usage by Month', 'Standard librarian format'], color: 'hsl(0,72%,55%)' },
  { icon: Download, title: 'CSV Export', items: ['One-click download', 'Compatible with existing library systems', 'Automated report generation'], color: 'hsl(174,72%,46%)' },
  { icon: Activity, title: 'Enterprise Dashboard', items: ['Seat utilization tracking', 'Collection usage stats', 'AI query consumption'], color: 'hsl(38,95%,55%)' },
  { icon: ClipboardList, title: 'Audit Logs', items: ['Every user action tracked', 'Book access, AI queries, login events', 'Timestamps, IPs, targets'], color: 'hsl(152,69%,40%)' },
];

export function ReportingSlide() {
  return (
    <SlideLayout className="bg-[hsl(222,47%,6%)] text-[hsl(210,40%,92%)]">
      <div className="relative z-10 flex flex-col h-full px-24 py-16">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <span className="text-[14px] font-bold tracking-[0.3em] uppercase text-[hsl(0,72%,55%)] mb-3 block">Pillar 6</span>
          <h2 className="text-[64px] font-black tracking-tight">Usage & Reporting</h2>
          <p className="text-[22px] text-[hsl(215,20%,55%)] mt-2">COUNTER 5.1 compliant reporting for institutional librarians</p>
          <div className="w-24 h-1.5 rounded-full bg-[hsl(0,72%,55%)] mt-4" />
        </motion.div>

        <div className="grid grid-cols-2 gap-8 mt-12 flex-1">
          {reportCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.6 }}
              className="rounded-2xl border border-[hsl(220,20%,16%)] bg-gradient-to-br from-[hsl(222,40%,10%)] to-[hsl(222,40%,8%)] p-8 hover:border-[hsl(174,72%,46%/0.3)] transition-all duration-500"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: `${card.color.replace(')', '/0.12)')}` }}>
                  <card.icon className="w-7 h-7" style={{ color: card.color }} />
                </div>
                <h3 className="text-[26px] font-bold">{card.title}</h3>
              </div>
              <ul className="space-y-3">
                {card.items.map((item, j) => (
                  <motion.li
                    key={j}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 + j * 0.08 }}
                    className="flex items-start gap-3 text-[18px] text-[hsl(215,20%,55%)]"
                  >
                    <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: card.color }} />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Database tables footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-4 flex gap-6 text-[15px] font-mono"
        >
          {['usage_events', 'ai_query_logs', 'audit_logs'].map(table => (
            <div key={table} className="px-4 py-2 rounded-lg border border-[hsl(220,20%,16%)] bg-[hsl(222,40%,9%)]">
              <span className="text-[hsl(174,72%,46%)]">→</span> <span className="text-[hsl(38,95%,55%)]">{table}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </SlideLayout>
  );
}
