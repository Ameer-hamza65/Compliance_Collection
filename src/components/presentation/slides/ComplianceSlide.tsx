import { motion } from 'framer-motion';
import { SlideLayout } from '../SlideLayout';
import { FolderLock } from 'lucide-react';

const collections = [
  { name: 'Clinical Anesthesia', books: 3, tier: 'Basic', color: 'hsl(174,72%,46%)' },
  { name: 'Perioperative Nursing', books: 2, tier: 'Basic', color: 'hsl(174,72%,46%)' },
  { name: 'Surgical Standards', books: 4, tier: 'Pro', color: 'hsl(38,95%,55%)' },
  { name: 'Emergency Medicine', books: 3, tier: 'Pro', color: 'hsl(38,95%,55%)' },
  { name: 'Regulatory & Compliance', books: 5, tier: 'Enterprise', color: 'hsl(262,60%,65%)' },
];

const tierAccess = [
  { tier: 'Basic', unlocked: '2 / 5', desc: 'Core clinical bundles', color: 'hsl(174,72%,46%)' },
  { tier: 'Pro', unlocked: '5 / 5', desc: 'All system bundles', color: 'hsl(38,95%,55%)' },
  { tier: 'Enterprise', unlocked: '5 / 5 + Custom', desc: 'Custom institutional bundles', color: 'hsl(262,60%,65%)' },
];

export function ComplianceSlide() {
  return (
    <SlideLayout className="bg-[hsl(222,47%,6%)] text-[hsl(210,40%,92%)]">
      <div className="relative z-10 flex flex-col h-full px-24 py-14">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(38,95%,55%/0.12)] flex items-center justify-center">
            <FolderLock className="w-7 h-7 text-[hsl(38,95%,55%)]" />
          </div>
          <div>
            <h2 className="text-[56px] font-black tracking-tight">Compliance Collections</h2>
            <p className="text-[20px] text-[hsl(215,20%,55%)]">Tier-gated content bundles for institutional compliance</p>
          </div>
        </motion.div>

        <div className="flex-1 flex gap-10">
          {/* Collections list */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="text-[13px] text-[hsl(215,20%,45%)] font-bold tracking-[4px] uppercase mb-1">System Bundles</div>
            {collections.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex-1 rounded-xl border border-[hsl(220,20%,14%)] bg-[hsl(222,40%,9%)] px-6 flex items-center gap-5"
              >
                <FolderLock className="w-6 h-6 flex-shrink-0" style={{ color: c.color }} />
                <div className="flex-1">
                  <div className="text-[18px] font-bold">{c.name}</div>
                  <div className="text-[14px] text-[hsl(215,20%,50%)]">{c.books} titles</div>
                </div>
                <div className="px-3 py-1 rounded-full text-[12px] font-bold border" style={{ color: c.color, borderColor: c.color }}>
                  {c.tier}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tier access breakdown */}
          <div className="w-[450px] flex flex-col gap-5">
            <div className="text-[13px] text-[hsl(215,20%,45%)] font-bold tracking-[4px] uppercase mb-1">Tier Access</div>
            {tierAccess.map((t, i) => (
              <motion.div
                key={t.tier}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12 }}
                className="flex-1 rounded-2xl border border-[hsl(220,20%,14%)] bg-[hsl(222,40%,9%)] p-8 flex flex-col justify-center"
                style={{ borderLeftWidth: 4, borderLeftColor: t.color }}
              >
                <div className="text-[28px] font-black mb-1" style={{ color: t.color }}>{t.tier}</div>
                <div className="text-[36px] font-black mb-2">{t.unlocked}</div>
                <div className="text-[15px] text-[hsl(215,20%,50%)]">{t.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
