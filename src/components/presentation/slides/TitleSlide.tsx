import { motion } from 'framer-motion';
import { SlideLayout } from '../SlideLayout';
import { Shield, Zap, Database } from 'lucide-react';

export function TitleSlide() {
  return (
    <SlideLayout className="bg-[hsl(222,47%,6%)] text-[hsl(210,40%,92%)]">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(hsl(174,72%,46%) 1px, transparent 1px), linear-gradient(90deg, hsl(174,72%,46%) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />
      
      {/* Glow orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(174 72% 46% / 0.12) 0%, transparent 70%)', top: '10%', right: '5%' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(38 95% 55% / 0.08) 0%, transparent 70%)', bottom: '10%', left: '10%' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-3 h-3 rounded-full bg-[hsl(174,72%,46%)] animate-pulse" />
          <span className="text-[22px] font-medium tracking-[0.3em] uppercase text-[hsl(174,72%,46%)]">
            Institutional SaaS Platform
          </span>
          <div className="w-3 h-3 rounded-full bg-[hsl(174,72%,46%)] animate-pulse" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-[110px] font-black leading-[1.05] text-center tracking-tight"
        >
          <span className="text-[hsl(210,40%,92%)]">Compliance</span>
          <br />
          <span style={{ background: 'linear-gradient(135deg, hsl(174,72%,46%), hsl(38,95%,55%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Collections AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-[28px] text-[hsl(215,20%,55%)] mt-8 text-center max-w-[900px] leading-relaxed"
        >
          AI-Powered Clinical Content Platform for Hospitals & Surgery Centers
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex gap-12 mt-16"
        >
          {[
            { icon: Database, label: 'Repository Architecture' },
            { icon: Shield, label: 'Enterprise Security' },
            { icon: Zap, label: 'AI-Powered Ingestion' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-3 px-6 py-3 rounded-full border border-[hsl(220,20%,16%)] bg-[hsl(222,40%,9%)/0.6]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + i * 0.15 }}
            >
              <item.icon className="w-5 h-5 text-[hsl(174,72%,46%)]" />
              <span className="text-[18px] font-medium">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-16 flex items-center gap-6 text-[18px] text-[hsl(215,20%,45%)]"
        >
          <span>Rittenhouse Stakeholder Demo</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(174,72%,46%)]" />
          <span>Sarasota, FL</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(174,72%,46%)]" />
          <span>March 2026</span>
        </motion.div>
      </div>
    </SlideLayout>
  );
}
