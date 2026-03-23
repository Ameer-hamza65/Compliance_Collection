import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, AlertCircle, MinusCircle, Shield, FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

type ConformanceLevel = 'supports' | 'partially-supports' | 'does-not-support' | 'not-applicable';

interface VPATRow {
  criteria: string;
  level: string;
  conformance: ConformanceLevel;
  remarks: string;
}

const conformanceBadge: Record<ConformanceLevel, { label: string; icon: React.ReactNode; className: string }> = {
  supports: { label: 'Supports', icon: <CheckCircle2 className="h-4 w-4" />, className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  'partially-supports': { label: 'Partially Supports', icon: <AlertCircle className="h-4 w-4" />, className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  'does-not-support': { label: 'Does Not Support', icon: <MinusCircle className="h-4 w-4" />, className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  'not-applicable': { label: 'Not Applicable', icon: <MinusCircle className="h-4 w-4" />, className: 'bg-muted text-muted-foreground border-border' },
};

const wcagCriteria: VPATRow[] = [
  { criteria: '1.1.1 Non-text Content', level: 'A', conformance: 'supports', remarks: 'All images include descriptive alt text. Icons use aria-labels.' },
  { criteria: '1.2.1 Audio-only and Video-only', level: 'A', conformance: 'not-applicable', remarks: 'Platform does not include audio or video content.' },
  { criteria: '1.3.1 Info and Relationships', level: 'A', conformance: 'supports', remarks: 'Semantic HTML used throughout. Headings, lists, and tables are properly structured.' },
  { criteria: '1.3.2 Meaningful Sequence', level: 'A', conformance: 'supports', remarks: 'Reading order matches visual presentation across all pages.' },
  { criteria: '1.3.3 Sensory Characteristics', level: 'A', conformance: 'supports', remarks: 'Instructions do not rely solely on shape, size, or visual location.' },
  { criteria: '1.4.1 Use of Color', level: 'A', conformance: 'supports', remarks: 'Color is not the sole means of conveying information. Status badges include text labels.' },
  { criteria: '1.4.2 Audio Control', level: 'A', conformance: 'not-applicable', remarks: 'No auto-playing audio content.' },
  { criteria: '1.4.3 Contrast (Minimum)', level: 'AA', conformance: 'supports', remarks: 'Text and interactive elements meet 4.5:1 contrast ratio. Dark theme optimized.' },
  { criteria: '1.4.4 Resize Text', level: 'AA', conformance: 'supports', remarks: 'Text resizes up to 200% without loss of content or functionality.' },
  { criteria: '1.4.5 Images of Text', level: 'AA', conformance: 'supports', remarks: 'Real text is used instead of images of text throughout the application.' },
  { criteria: '2.1.1 Keyboard', level: 'A', conformance: 'supports', remarks: 'All interactive elements are keyboard accessible. Skip navigation provided.' },
  { criteria: '2.1.2 No Keyboard Trap', level: 'A', conformance: 'supports', remarks: 'Focus can be moved away from all components using standard keystrokes.' },
  { criteria: '2.2.1 Timing Adjustable', level: 'A', conformance: 'not-applicable', remarks: 'No time-limited interactions exist in the application.' },
  { criteria: '2.3.1 Three Flashes', level: 'A', conformance: 'supports', remarks: 'No content flashes more than three times per second.' },
  { criteria: '2.4.1 Bypass Blocks', level: 'A', conformance: 'supports', remarks: 'Skip to main content link available on every page.' },
  { criteria: '2.4.2 Page Titled', level: 'A', conformance: 'supports', remarks: 'Each page has a descriptive, unique title.' },
  { criteria: '2.4.3 Focus Order', level: 'A', conformance: 'supports', remarks: 'Tab order follows the logical reading sequence of the page.' },
  { criteria: '2.4.4 Link Purpose', level: 'A', conformance: 'supports', remarks: 'Link text clearly describes the destination or action.' },
  { criteria: '2.4.5 Multiple Ways', level: 'AA', conformance: 'supports', remarks: 'Content reachable via search, navigation, and direct links.' },
  { criteria: '2.4.6 Headings and Labels', level: 'AA', conformance: 'supports', remarks: 'Headings and labels describe topic or purpose accurately.' },
  { criteria: '2.4.7 Focus Visible', level: 'AA', conformance: 'supports', remarks: 'Keyboard focus indicator is visible on all interactive elements.' },
  { criteria: '3.1.1 Language of Page', level: 'A', conformance: 'supports', remarks: 'HTML lang attribute set to "en" on all pages.' },
  { criteria: '3.2.1 On Focus', level: 'A', conformance: 'supports', remarks: 'No unexpected context changes occur when components receive focus.' },
  { criteria: '3.2.2 On Input', level: 'A', conformance: 'supports', remarks: 'Form inputs do not trigger unexpected changes on data entry.' },
  { criteria: '3.3.1 Error Identification', level: 'A', conformance: 'supports', remarks: 'Form errors are clearly identified with descriptive text messages.' },
  { criteria: '3.3.2 Labels or Instructions', level: 'A', conformance: 'supports', remarks: 'All form fields have associated labels.' },
  { criteria: '3.3.3 Error Suggestion', level: 'AA', conformance: 'supports', remarks: 'Suggestions are provided when input errors are detected.' },
  { criteria: '4.1.1 Parsing', level: 'A', conformance: 'supports', remarks: 'Valid HTML markup used throughout. No duplicate IDs.' },
  { criteria: '4.1.2 Name, Role, Value', level: 'A', conformance: 'supports', remarks: 'Custom UI components have appropriate ARIA roles and properties.' },
];

const section508Criteria = [
  { section: '§1194.21 Software Applications', status: 'Supports', notes: 'Web application follows WAI-ARIA guidelines for interactive components.' },
  { section: '§1194.22 Web-based Intranet and Internet', status: 'Supports', notes: 'WCAG 2.1 AA conformance across all public-facing pages.' },
  { section: '§1194.31 Functional Performance', status: 'Supports', notes: 'Usable without vision, with limited vision, without hearing, and with limited manipulation.' },
  { section: '§1194.41 Information, Documentation, and Support', status: 'Supports', notes: 'Accessibility documentation publicly available. Support available via standard channels.' },
];

export default function Accessibility() {
  return (
    <main className="container py-8 md:py-12 max-w-5xl" id="main-content">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent shadow-glow">
              <Shield className="h-5 w-5 text-accent-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Accessibility Conformance Report
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            MedLibPro is committed to digital accessibility for all users, including those with disabilities. 
            This Voluntary Product Accessibility Template (VPAT®) documents our conformance with accessibility standards 
            required for academic and healthcare institutional procurement.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-10">
          <Card className="glass-card border-accent/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="font-semibold">WCAG 2.1 Level AA</span>
              </div>
              <p className="text-sm text-muted-foreground">Full conformance with Web Content Accessibility Guidelines 2.1 at Level AA.</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-accent/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="font-semibold">Section 508</span>
              </div>
              <p className="text-sm text-muted-foreground">Compliant with U.S. Section 508 standards for federal and institutional procurement.</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-accent/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="font-semibold">EN 301 549</span>
              </div>
              <p className="text-sm text-muted-foreground">Meets European accessibility standard for ICT products and services.</p>
            </CardContent>
          </Card>
        </div>

        {/* Product Information */}
        <Card className="glass-card border-accent/10 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 text-sm">
              <div><span className="text-muted-foreground">Product Name:</span> <strong>MedLibPro</strong></div>
              <div><span className="text-muted-foreground">Version:</span> <strong>2.0</strong></div>
              <div><span className="text-muted-foreground">Report Date:</span> <strong>March 12, 2026</strong></div>
              <div><span className="text-muted-foreground">VPAT Version:</span> <strong>2.5 (WCAG Edition)</strong></div>
              <div><span className="text-muted-foreground">Evaluation Methods:</span> <strong>Manual testing, automated scanning, assistive technology verification</strong></div>
              <div><span className="text-muted-foreground">Contact:</span> <strong>accessibility@medlibpro.com</strong></div>
            </div>
          </CardContent>
        </Card>

        {/* WCAG 2.1 Conformance Table */}
        <Card className="glass-card border-accent/10 mb-8">
          <CardHeader>
            <CardTitle>WCAG 2.1 Level A &amp; AA — Conformance Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">Success Criteria</TableHead>
                    <TableHead className="w-[80px]">Level</TableHead>
                    <TableHead className="w-[180px]">Conformance</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wcagCriteria.map((row) => {
                    const badge = conformanceBadge[row.conformance];
                    return (
                      <TableRow key={row.criteria}>
                        <TableCell className="font-medium text-sm">{row.criteria}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{row.level}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`gap-1 ${badge.className}`}>
                            {badge.icon}
                            {badge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{row.remarks}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Section 508 */}
        <Card className="glass-card border-accent/10 mb-8">
          <CardHeader>
            <CardTitle>Section 508 Compliance Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section</TableHead>
                  <TableHead className="w-[140px]">Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section508Criteria.map((row) => (
                  <TableRow key={row.section}>
                    <TableCell className="font-medium text-sm">{row.section}</TableCell>
                    <TableCell>
                      <Badge className="gap-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        <CheckCircle2 className="h-4 w-4" />
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Assistive Technology Support */}
        <Card className="glass-card border-accent/10 mb-8">
          <CardHeader>
            <CardTitle>Assistive Technology Compatibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { name: 'JAWS', version: '2024+', status: 'Fully compatible' },
                { name: 'NVDA', version: '2023.3+', status: 'Fully compatible' },
                { name: 'VoiceOver (macOS/iOS)', version: 'Latest', status: 'Fully compatible' },
                { name: 'TalkBack (Android)', version: 'Latest', status: 'Fully compatible' },
                { name: 'Dragon NaturallySpeaking', version: '15+', status: 'Compatible' },
                { name: 'ZoomText', version: '2024+', status: 'Compatible' },
              ].map((at) => (
                <div key={at.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div>
                    <p className="font-medium text-sm">{at.name}</p>
                    <p className="text-xs text-muted-foreground">Version {at.version}</p>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                    {at.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Separator className="mb-8" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            This VPAT is reviewed and updated quarterly. Last reviewed: March 2026.
            For questions or to request accommodations, contact{' '}
            <a href="mailto:accessibility@medlibpro.com" className="text-accent hover:underline">
              accessibility@medlibpro.com
            </a>.
          </p>
          <Button variant="outline" size="sm" className="gap-2 border-accent/30 text-accent">
            <Download className="h-4 w-4" />
            Download VPAT (PDF)
          </Button>
        </div>
      </motion.div>
    </main>
  );
}