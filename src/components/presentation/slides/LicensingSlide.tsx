import { motion } from 'framer-motion';
import { SlideLayout } from '../SlideLayout';
import { CreditCard } from 'lucide-react';

const tiers = [
  {
    name: 'Basic',
    price: 'Contact Sales',
    color: 'hsl(174,72%,46%)',
    features: ['Up to 10 seats', '2 compliance bundles', '100 AI queries/mo', 'Basic COUNTER reports', 'Email support'],
  },
  {
    name: 'Pro',
    price: 'Contact Sales',
    color: 'hsl(38,95%,55%)',
    features: ['Up to 25 seats', 'All 5 compliance bundles', '500 AI queries/mo', 'Enhanced reporting', 'Add-on builder', 'Priority support'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    color: 'hsl(262,60%,65%)',
    features: ['250+ seats', 'Custom bundles', 'Unlimited AI queries', 'Full COUNTER 5.1', 'Multi-location', 'SSO/SAML', 'Dedicated CSM'],
  },
];

export function LicensingSlide() {
  return (
    <SlideLayout className="bg-[hsl(222,47%,6%)] text-[hsl(210,40%,92%)]">
      <div className="relative z-10 flex flex-col h-full px-24 py-14">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-5 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(262,60%,65%/0.12)] flex items-center justify-center">
            <CreditCard className="w-7 h-7 text-[hsl(262,60%,65%)]" />
          </div>
          <div>
            <h2 className="text-[56px] font-black tracking-tight">Institutional Licensing</h2>
            <p className="text-[20px] text-[hsl(215,20%,55%)]">Three tiers — priced per bed count, not per user</p>
          </div>
        </motion.div>

        <div className="flex-1 flex gap-8 items-stretch">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.12 }}
              className={`flex-1 rounded-2xl border p-8 flex flex-col ${
                tier.highlighted
                  ? 'border-[hsl(38,95%,55%/0.5)] bg-[hsl(38,95%,55%/0.04)]'
                  : 'border-[hsl(220,20%,14%)] bg-[hsl(222,40%,9%)]'
              }`}
            >
              {tier.highlighted && (
                <div className="text-[12px] font-bold tracking-[3px] uppercase mb-3" style={{ color: tier.color }}>
                  MOST POPULAR
                </div>
              )}
              <div className="text-[32px] font-black mb-1" style={{ color: tier.color }}>{tier.name}</div>
              <div className="text-[20px] font-bold text-[hsl(215,20%,55%)] mb-6">{tier.price}</div>
              <div className="flex-1 flex flex-col gap-3">
                {tier.features.map(f => (
                  <div key={f} className="flex items-center gap-3 text-[16px]">
                    <span style={{ color: tier.color }}>✓</span>
                    <span className="text-[hsl(215,20%,70%)]">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center text-[16px] text-[hsl(215,20%,50%)]"
        >
          All plans include HIPAA-ready infrastructure, encrypted storage, and audit logging
        </motion.div>
      </div>
    </SlideLayout>
  );
}
