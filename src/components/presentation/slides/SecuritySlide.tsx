import { motion } from 'framer-motion';
import { SlideLayout } from '../SlideLayout';
import { Shield, Users, Lock, Key } from 'lucide-react';

const tierData = [
  { tier: 'Basic', seats: '10', collections: '2/5', ai: '100/mo', addons: false, multi: false, color: 'hsl(215,20%,55%)' },
  { tier: 'Pro', seats: '25', collections: '5/5', ai: '500/mo', addons: true, multi: false, color: 'hsl(174,72%,46%)' },
  { tier: 'Enterprise', seats: '250+', collections: '5/5 + Custom', ai: 'Unlimited', addons: true, multi: true, color: 'hsl(38,95%,55%)' },
];

export function SecuritySlide() {
  return (
    <SlideLayout className="bg-[hsl(222,47%,6%)] text-[hsl(210,40%,92%)]">
      <div className="relative z-10 flex flex-col h-full px-24 py-16">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <span className="text-[14px] font-bold tracking-[0.3em] uppercase text-[hsl(152,69%,40%)] mb-3 block">Pillar 2</span>
          <h2 className="text-[64px] font-black tracking-tight">Security & Access Control</h2>
          <div className="w-24 h-1.5 rounded-full bg-[hsl(152,69%,40%)] mt-4" />
        </motion.div>

        <div className="flex gap-10 mt-12 flex-1">
          {/* Left — features */}
          <div className="w-[40%] space-y-5">
            {[
              { icon: Lock, title: 'Row-Level Security', desc: 'Every table has RLS policies — data is isolated per enterprise' },
              { icon: Shield, title: 'Tier-Gated Collections', desc: 'Basic sees 2/5 unlocked; Pro/Enterprise see all 5' },
              { icon: Users, title: 'Seat Enforcement', desc: 'Warning at 90%, hard block at 100% with upgrade CTA' },
              { icon: Key, title: 'Role-Based Access', desc: 'Admin, Compliance Officer, Dept Manager, Staff' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
                className="flex gap-5 p-5 rounded-xl border border-[hsl(220,20%,16%)] bg-[hsl(222,40%,9%)]"
              >
                <div className="w-11 h-11 rounded-lg bg-[hsl(152,69%,40%/0.1)] flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-[hsl(152,69%,40%)]" />
                </div>
                <div>
                  <h3 className="text-[20px] font-bold mb-1">{f.title}</h3>
                  <p className="text-[16px] text-[hsl(215,20%,55%)]">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right — tier matrix */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="flex-1 rounded-2xl border border-[hsl(220,20%,16%)] bg-[hsl(222,40%,9%)] p-8"
          >
            <h3 className="text-[22px] font-bold mb-6">Tier Enforcement Matrix</h3>
            <table className="w-full text-[17px]">
              <thead>
                <tr className="border-b border-[hsl(220,20%,16%)]">
                  <th className="text-left py-3 text-[hsl(215,20%,45%)] font-semibold">Feature</th>
                  {tierData.map(t => (
                    <th key={t.tier} className="text-center py-3 font-bold" style={{ color: t.color }}>{t.tier}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[hsl(215,20%,55%)]">
                {[
                  { label: 'Seats', vals: tierData.map(t => t.seats) },
                  { label: 'Collections', vals: tierData.map(t => t.collections) },
                  { label: 'AI Queries', vals: tierData.map(t => t.ai) },
                  { label: 'Add-On Builder', vals: tierData.map(t => t.addons ? '✅' : '❌') },
                  { label: 'Multi-Location', vals: tierData.map(t => t.multi ? '✅' : '❌') },
                ].map((row, i) => (
                  <motion.tr
                    key={row.label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="border-b border-[hsl(220,20%,12%)]"
                  >
                    <td className="py-3.5 font-medium text-[hsl(210,40%,92%)]">{row.label}</td>
                    {row.vals.map((v, j) => (
                      <td key={j} className="text-center py-3.5">{v}</td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>
    </SlideLayout>
  );
}
