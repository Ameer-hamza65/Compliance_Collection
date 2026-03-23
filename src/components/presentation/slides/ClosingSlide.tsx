import { motion } from 'framer-motion';
import { SlideLayout } from '../SlideLayout';
import { CheckCircle2 } from 'lucide-react';

const highlights = [
  'PostgreSQL Row-Level Security for tenant isolation',
  'AI-powered content ingestion with Gemini',
  'COUNTER 5.1 compliant librarian reporting',
  'Tier-gated collections with seat enforcement',
  'Chapter-scoped AI Q&A — internal content only',
  'Full audit trail with governance logging',
];

export function ClosingSlide() {
  return (
    <SlideLayout className="bg-[hsl(222,47%,6%)] text-[hsl(210,40%,92%)]">
      {/* Glow */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(174 72% 46% / 0.08) 0%, transparent 70%)', top: '-20%', right: '-10%' }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="text-center mb-12"
        >
          <h2 className="text-[80px] font-black tracking-tight leading-tight">
            <span className="text-[hsl(210,40%,92%)]">Infrastructure</span>
            <br />
            <span style={{ background: 'linear-gradient(135deg, hsl(174,72%,46%), hsl(38,95%,55%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Built to Scale
            </span>
          </h2>
          <p className="text-[24px] text-[hsl(215,20%,55%)] mt-6 max-w-[700px] mx-auto">
            The hardest 80% is complete. The remaining 20% is UI polish and client-specific configuration.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-x-16 gap-y-5 max-w-[1000px]">
          {highlights.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-4"
            >
              <CheckCircle2 className="w-6 h-6 text-[hsl(152,69%,40%)] flex-shrink-0" />
              <span className="text-[20px]">{h}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mt-16 px-12 py-5 rounded-2xl border border-[hsl(174,72%,46%/0.3)] bg-[hsl(174,72%,46%/0.06)]"
        >
          <p className="text-[24px] font-semibold text-center">
            <span className="text-[hsl(174,72%,46%)]">Next Steps:</span>{' '}
            <span className="text-[hsl(215,20%,55%)]">IdP details for SSO → Custom pricing per bed count → Onboarding</span>
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-14 text-[18px] text-[hsl(215,20%,45%)]"
        >
          Compliance Collections AI — Rittenhouse • Sarasota, FL • March 2026
        </motion.p>
      </div>
    </SlideLayout>
  );
}
