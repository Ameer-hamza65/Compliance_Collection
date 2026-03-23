import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, CheckCircle, Building2 } from 'lucide-react';
import { z } from 'zod';

const quoteSchema = z.object({
  institution_name: z.string().trim().min(2, 'Institution name is required').max(200),
  contact_name: z.string().trim().min(2, 'Your name is required').max(100),
  contact_email: z.string().trim().email('Please enter a valid email').max(255),
  domain: z.string().trim().min(3, 'Domain is required (e.g. company.com)').max(100)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Enter a valid domain like company.com'),
  estimated_users: z.number().int().min(1, 'At least 1 user').max(100000),
  message: z.string().trim().max(2000).optional(),
});

interface QuoteRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tierName: string;
  tierId: string;
}

export default function QuoteRequestModal({ open, onOpenChange, tierName, tierId }: QuoteRequestModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    institution_name: '',
    contact_name: '',
    contact_email: '',
    domain: '',
    estimated_users: 10,
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = quoteSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('quote_requests' as any).insert({
      institution_name: result.data.institution_name,
      contact_name: result.data.contact_name,
      contact_email: result.data.contact_email,
      domain: result.data.domain,
      tier_requested: tierId,
      estimated_users: result.data.estimated_users,
      message: result.data.message || null,
    } as any);

    setSubmitting(false);

    if (error) {
      toast.error('Failed to submit request. Please try again.');
      return;
    }

    setSubmitted(true);
    toast.success('Quote request submitted successfully!');
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setSubmitted(false);
      setForm({ institution_name: '', contact_name: '', contact_email: '', domain: '', estimated_users: 10, message: '' });
      setErrors({});
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {submitted ? (
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Request Received!</h3>
            <p className="text-muted-foreground text-sm mb-6">
              We'll review your quote request for the <strong>{tierName}</strong> plan
              and reach out within 1–2 business days.
            </p>
            <Button variant="outline" onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-5 w-5 text-accent" />
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 text-xs">
                  {tierName} Plan
                </Badge>
              </div>
              <DialogTitle>Request a Quote</DialogTitle>
              <DialogDescription>
                Tell us about your institution and we'll prepare a customized pricing proposal.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="institution_name">Institution Name *</Label>
                <Input
                  id="institution_name"
                  placeholder="e.g. Sarasota Memorial Hospital"
                  value={form.institution_name}
                  onChange={e => setForm(f => ({ ...f, institution_name: e.target.value }))}
                />
                {errors.institution_name && <p className="text-xs text-destructive">{errors.institution_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Institution Domain *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">@</span>
                  <Input
                    id="domain"
                    placeholder="hospital.org"
                    value={form.domain}
                    onChange={e => {
                      const val = e.target.value.replace(/^@/, '');
                      setForm(f => ({ ...f, domain: val }));
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Staff who sign up with this domain will auto-join your enterprise</p>
                {errors.domain && <p className="text-xs text-destructive">{errors.domain}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Your Name *</Label>
                  <Input
                    id="contact_name"
                    placeholder="Jane Smith"
                    value={form.contact_name}
                    onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                  />
                  {errors.contact_name && <p className="text-xs text-destructive">{errors.contact_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Work Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    placeholder="jane@hospital.org"
                    value={form.contact_email}
                    onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                  />
                  {errors.contact_email && <p className="text-xs text-destructive">{errors.contact_email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_users">Estimated Number of Users *</Label>
                <Input
                  id="estimated_users"
                  type="number"
                  min={1}
                  value={form.estimated_users}
                  onChange={e => setForm(f => ({ ...f, estimated_users: parseInt(e.target.value) || 1 }))}
                />
                {errors.estimated_users && <p className="text-xs text-destructive">{errors.estimated_users}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Additional Notes</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your compliance needs, departments, or special requirements..."
                  rows={3}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                />
              </div>

              <Button type="submit" variant="cta" className="w-full shadow-glow" disabled={submitting}>
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting…' : 'Submit Quote Request'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
