import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnterprise } from '@/context/EnterpriseContext';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, Building2, Shield, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { licensingTiers, TierDefinition } from '@/data/complianceData';
import QuoteRequestModal from '@/components/QuoteRequestModal';

const tierIcons: Record<string, typeof Building2> = {
  basic: Building2,
  pro: Zap,
  enterprise: Crown,
};

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <li className="flex items-center gap-2.5 text-sm py-1">
      {included ? (
        <Check className="h-4 w-4 text-accent flex-shrink-0" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
      )}
      <span className={included ? 'text-foreground' : 'text-muted-foreground/60'}>{label}</span>
    </li>
  );
}

function TierCard({ tier, featured = false, onRequestQuote }: { tier: TierDefinition; featured?: boolean; onRequestQuote: (tierName: string, tierId: string) => void }) {
  const Icon = tierIcons[tier.id] || Building2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className={`h-full relative ${featured ? 'border-accent/40 shadow-glow glass-card' : 'glass-card glow-border'}`}>
        {featured && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-accent text-accent-foreground px-4 py-1 text-xs font-semibold">
              Most Popular
            </Badge>
          </div>
        )}
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${featured ? 'bg-accent text-accent-foreground' : 'bg-accent/10 text-accent'}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
              <p className="text-xs text-muted-foreground">{tier.description}</p>
            </div>
          </div>

          <div className="pt-2">
            {tier.pricing.type === 'fixed' ? (
              <div>
                <span className="text-4xl font-extrabold text-foreground font-mono">
                  {tier.pricing.label}
                </span>
                <span className="text-sm text-muted-foreground ml-1">billed annually</span>
                <p className="text-xs text-muted-foreground mt-1">
                  ${tier.pricing.perSeatPrice}/seat · Up to {tier.maxSeats} users
                </p>
              </div>
            ) : (
              <div>
                <span className="text-3xl font-extrabold text-foreground">Custom Pricing</span>
                <p className="text-xs text-muted-foreground mt-1">Multi-location · Unlimited users</p>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 flex flex-col flex-1">
          <div className="border-t border-border/50 pt-4 mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Content Access</p>
            <ul className="space-y-1">
              <FeatureRow label={tier.collectionsAccess === 'all' ? 'All 5 collections (50 titles)' : `${tier.maxCollections} collections`} included />
              <FeatureRow label="Cross-title search" included />
              <FeatureRow label="Add-on titles" included={tier.features.addOnTitles} />
              <FeatureRow label="Custom collections" included={tier.features.customCollections} />
            </ul>
          </div>

          <div className="border-t border-border/50 pt-4 mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">AI Capabilities</p>
            <ul className="space-y-1">
              <FeatureRow label="AI chapter summaries" included={tier.features.aiSummaries} />
              <FeatureRow label="Compliance point extraction" included={tier.features.aiComplianceExtraction} />
              <FeatureRow label="Chapter-scoped Q&A" included={tier.features.aiChapterQA} />
              <FeatureRow
                label={tier.features.aiUsageMonthly === -1 ? 'Unlimited AI queries' : `${tier.features.aiUsageMonthly} AI queries/mo`}
                included
              />
            </ul>
          </div>

          <div className="border-t border-border/50 pt-4 mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Reporting & Admin</p>
            <ul className="space-y-1">
              <FeatureRow label={`${tier.features.reportingLevel.charAt(0).toUpperCase() + tier.features.reportingLevel.slice(1)} reporting`} included />
              <FeatureRow label="CSV export" included={tier.features.csvExport} />
              <FeatureRow label="Department breakdown" included={tier.features.departmentBreakdown} />
              <FeatureRow label="COUNTER 5.1 reports" included />
              <FeatureRow label="Compliance scoring" included={tier.features.complianceScoring} />
              <FeatureRow label="Multi-location support" included={tier.features.multiLocation} />
              <FeatureRow label="SSO integration" included={tier.features.ssoIntegration} />
              <FeatureRow label="API access" included={tier.features.apiAccess} />
              <FeatureRow label="Dedicated support" included={tier.features.dedicatedSupport} />
            </ul>
          </div>

          <div className="mt-auto pt-4">
            <Button
              variant={featured ? 'cta' : 'outline'}
              className={`w-full ${featured ? 'shadow-glow' : 'border-accent/30 text-accent hover:bg-accent/10'}`}
              size="lg"
              onClick={() => onRequestQuote(tier.name, tier.id)}
            >
              {tier.pricing.type === 'custom' ? 'Contact Sales' : 'Request Quote'}
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function InstitutionalPricing() {
  const navigate = useNavigate();
  const { isEnterpriseMode, currentEnterprise } = useEnterprise();
  const [quoteModal, setQuoteModal] = useState<{ open: boolean; tierName: string; tierId: string }>({
    open: false, tierName: '', tierId: '',
  });

  const openQuote = (tierName: string, tierId: string) => {
    setQuoteModal({ open: true, tierName, tierId });
  };

  // Enterprise users see a banner instead of quote buttons
  if (isEnterpriseMode && currentEnterprise) {
    return (
      <div className="min-h-screen bg-background">
        <section className="relative overflow-hidden py-20 px-4">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="container max-w-4xl mx-auto text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge className="bg-accent/10 text-accent border-accent/20 mb-6">
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                Active Subscription
              </Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
                You're part of <span className="text-accent text-glow">{currentEnterprise.name}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Your institution already has an active subscription. Contact your administrator to manage seats or upgrade your plan.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="cta" size="lg" onClick={() => navigate('/enterprise')}>
                  Go to Dashboard
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/collections')}>
                  Browse Collections
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
        <div className="container max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-accent/10 text-accent border-accent/20 mb-6">
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Institutional SaaS Licensing
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 tracking-tight">
              Tiered Institutional <span className="text-accent text-glow">Pricing</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Compliance Collections AI is licensed per institution with seat-based access,
              collection entitlements, and full data isolation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container pb-20 -mt-4">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {licensingTiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} featured={tier.id === 'pro'} onRequestQuote={openQuote} />
          ))}
        </div>
      </section>

      {/* Enforcement Section */}
      <section className="container pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-8 md:p-12"
          >
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-6 text-center">
              Enterprise-Grade <span className="text-accent">Security & Enforcement</span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { title: 'Seat Limits', desc: 'Active user counts enforced per tier. Automatic alerts when approaching limits.' },
                { title: 'Collection Entitlements', desc: 'Content access controlled by tier. Only entitled collections visible to users.' },
                { title: 'Data Isolation', desc: 'Row-level security ensures complete institutional data separation across tenants.' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 mx-auto mb-3">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Need a Custom Solution?</h2>
          <p className="text-muted-foreground mb-6">
            Contact us for volume pricing, pilot programs, or custom deployment requirements.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="cta" size="lg" className="shadow-glow"
              onClick={() => openQuote('Enterprise', 'enterprise')}
            >
              Contact Sales
            </Button>
            <Button variant="outline" size="lg" className="border-accent/30 text-accent hover:bg-accent/10"
              onClick={() => navigate('/collections')}
            >
              Browse Collections
            </Button>
          </div>
        </div>
      </section>

      <QuoteRequestModal
        open={quoteModal.open}
        onOpenChange={(open) => setQuoteModal(prev => ({ ...prev, open }))}
        tierName={quoteModal.tierName}
        tierId={quoteModal.tierId}
      />
    </div>
  );
}