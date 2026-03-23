import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Building2 } from 'lucide-react';
import { LicensingTier } from '@/data/complianceData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TierBadgeProps {
  tier: LicensingTier;
  showIcon?: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const tierConfig: Record<LicensingTier, { label: string; icon: typeof Crown; className: string; description: string }> = {
  basic: {
    label: 'Basic',
    icon: Zap,
    className: 'bg-muted text-muted-foreground border-border',
    description: '10 users • 2 collections • 100 AI queries/mo',
  },
  pro: {
    label: 'Pro',
    icon: Crown,
    className: 'bg-primary/10 text-primary border-primary/20',
    description: '25 users • All collections • 500 AI queries/mo',
  },
  enterprise: {
    label: 'Enterprise',
    icon: Building2,
    className: 'bg-accent/10 text-accent border-accent/20',
    description: 'Custom users • All collections • Unlimited AI • Multi-location',
  },
};

export function TierBadge({ tier, showIcon = true, showTooltip = true, size = 'md' }: TierBadgeProps) {
  const config = tierConfig[tier];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  const iconSizes = { sm: 'h-2.5 w-2.5', md: 'h-3 w-3', lg: 'h-4 w-4' };

  const badge = (
    <Badge className={`${config.className} ${sizeClasses[size]} gap-1 font-semibold`}>
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{config.label} Plan</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
