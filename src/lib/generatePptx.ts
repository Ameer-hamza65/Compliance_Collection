import pptxgen from 'pptxgenjs';

const BG = '0B1120';
const FG = 'E0E8F0';
const TEAL = '1DB8A0';
const AMBER = 'E8A530';
const GREEN = '2DA06A';
const BLUE = '5B8DEF';
const PURPLE = '9966DD';
const RED = 'D94040';
const MUTED = '6B7A8D';
const CARD_BG = '131D2E';
const BORDER = '1E2A3D';

function addGridBg(slide: any) {
  slide.background = { color: BG };
}

function slideHeader(slide: any, label: string, title: string, color: string) {
  slide.addText(label, { x: 0.8, y: 0.5, w: 5, h: 0.4, fontSize: 12, color, fontFace: 'Arial', charSpacing: 6, bold: true });
  slide.addText(title, { x: 0.8, y: 0.9, w: 10, h: 0.8, fontSize: 36, color: FG, fontFace: 'Arial', bold: true });
  slide.addShape('rect' as any, { x: 0.8, y: 1.8, w: 1.5, h: 0.08, fill: { color } });
}

export function generatePptx() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Compliance Collections AI';
  pptx.subject = 'Sarasota Stakeholder Demo';
  pptx.title = 'Compliance Collections AI — Sarasota Demo';

  // ===== SLIDE 1: TITLE =====
  const s1 = pptx.addSlide();
  addGridBg(s1);
  s1.addShape(pptx.ShapeType.ellipse, { x: 8.5, y: 0.5, w: 4, h: 4, fill: { color: TEAL, transparency: 88 } });
  s1.addText('INSTITUTIONAL SAAS PLATFORM', { x: 1, y: 1.5, w: 11, h: 0.5, fontSize: 14, color: TEAL, fontFace: 'Arial', align: 'center', charSpacing: 8, bold: true });
  s1.addText([
    { text: 'Compliance\n', options: { color: FG, fontSize: 54, bold: true, fontFace: 'Arial' } },
    { text: 'Collections AI', options: { color: TEAL, fontSize: 54, bold: true, fontFace: 'Arial' } },
  ], { x: 1, y: 2.2, w: 11, h: 2.5, align: 'center', lineSpacingMultiple: 1.1 });
  s1.addText('AI-Powered Clinical Content Platform for Hospitals & Surgery Centers', { x: 2, y: 4.8, w: 9, h: 0.6, fontSize: 16, color: MUTED, fontFace: 'Arial', align: 'center' });
  const badges1 = ['Repository Architecture', 'Enterprise Security', 'AI-Powered Ingestion'];
  badges1.forEach((b, i) => {
    s1.addShape(pptx.ShapeType.roundRect, { x: 2.2 + i * 3.2, y: 5.8, w: 2.8, h: 0.5, rectRadius: 0.25, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
    s1.addText(b, { x: 2.2 + i * 3.2, y: 5.8, w: 2.8, h: 0.5, fontSize: 11, color: FG, fontFace: 'Arial', align: 'center', valign: 'middle' });
  });
  s1.addText('Rittenhouse Stakeholder Demo  •  Sarasota, FL  •  March 2026', { x: 1, y: 6.7, w: 11, h: 0.4, fontSize: 11, color: MUTED, fontFace: 'Arial', align: 'center' });

  // ===== SLIDE 2: AGENDA =====
  const s2 = pptx.addSlide();
  addGridBg(s2);
  s2.addText('OVERVIEW', { x: 1, y: 0.6, w: 5, h: 0.4, fontSize: 12, color: TEAL, fontFace: 'Arial', charSpacing: 6, bold: true });
  s2.addText('Presentation Overview', { x: 1, y: 1.0, w: 8, h: 0.8, fontSize: 40, color: FG, fontFace: 'Arial', bold: true });
  s2.addShape(pptx.ShapeType.rect, { x: 1, y: 1.9, w: 1.5, h: 0.08, fill: { color: TEAL } });

  const agendaItems = [
    { title: 'Platform Architecture', desc: 'Full-stack SaaS — five layers overview', color: BLUE },
    { title: 'Repository Architecture', desc: 'EPUB3/PDF storage with RLS-protected buckets', color: TEAL },
    { title: 'Security & Access', desc: 'Multi-tenant RLS, tier-gated collections', color: GREEN },
    { title: 'Authentication & Roles', desc: 'Five-tier RBAC with enterprise isolation', color: RED },
    { title: 'Metadata Structure', desc: 'Rich structured metadata for intelligent search', color: BLUE },
    { title: 'AI Automation', desc: 'Gemini-powered ingestion and chapter Q&A', color: AMBER },
    { title: 'Catalog & Search', desc: 'Weighted search with AI chapter Q&A', color: PURPLE },
    { title: 'Compliance Collections', desc: 'Tier-gated institutional content bundles', color: AMBER },
    { title: 'Enterprise Dashboard', desc: 'Real-time analytics and seat management', color: TEAL },
    { title: 'Reporting & Audit', desc: 'COUNTER 5.1 reports with CSV export', color: RED },
    { title: 'Institutional Licensing', desc: 'Three-tier pricing per bed count', color: PURPLE },
  ];
  agendaItems.forEach((p, i) => {
    const col = i < 6 ? 0 : 1;
    const row = col === 0 ? i : i - 6;
    const x = 1 + col * 5.8;
    const y = 2.4 + row * 0.82;
    s2.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.5, h: 0.7, rectRadius: 0.1, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
    s2.addShape(pptx.ShapeType.rect, { x, y, w: 0.05, h: 0.7, fill: { color: p.color } });
    s2.addText(p.title, { x: x + 0.3, y: y + 0.05, w: 4.5, h: 0.35, fontSize: 12, color: FG, fontFace: 'Arial', bold: true });
    s2.addText(p.desc, { x: x + 0.3, y: y + 0.35, w: 4.5, h: 0.3, fontSize: 10, color: MUTED, fontFace: 'Arial' });
  });

  // ===== SLIDE 3: ARCHITECTURE =====
  const s3 = pptx.addSlide();
  addGridBg(s3);
  slideHeader(s3, 'OVERVIEW', 'Platform Architecture', BLUE);

  const archLayers = [
    { name: 'Presentation Layer', tech: 'React 18, Vite, TypeScript', color: TEAL },
    { name: 'Application Layer', tech: 'React Router, Context API', color: BLUE },
    { name: 'API & Edge Functions', tech: 'Deno Edge Functions', color: AMBER },
    { name: 'Database Layer', tech: 'PostgreSQL 15, RLS', color: GREEN },
    { name: 'Storage Layer', tech: 'Object Storage, CDN', color: PURPLE },
  ];
  archLayers.forEach((l, i) => {
    s3.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 2.2 + i * 1.0, w: 7, h: 0.85, rectRadius: 0.1, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
    s3.addShape(pptx.ShapeType.rect, { x: 0.8, y: 2.2 + i * 1.0, w: 0.06, h: 0.85, fill: { color: l.color } });
    s3.addText(`${i + 1}. ${l.name}`, { x: 1.2, y: 2.25 + i * 1.0, w: 4, h: 0.4, fontSize: 14, color: FG, fontFace: 'Arial', bold: true });
    s3.addText(l.tech, { x: 1.2, y: 2.6 + i * 1.0, w: 4, h: 0.3, fontSize: 11, color: l.color, fontFace: 'Consolas' });
  });

  const archStats = [
    { label: 'Database Tables', value: '14+', color: GREEN },
    { label: 'RLS Policies', value: '30+', color: TEAL },
    { label: 'Edge Functions', value: '2', color: AMBER },
    { label: 'React Components', value: '80+', color: BLUE },
    { label: 'Pages / Routes', value: '12', color: PURPLE },
  ];
  archStats.forEach((s, i) => {
    s3.addShape(pptx.ShapeType.roundRect, { x: 8.5, y: 2.2 + i * 1.0, w: 4, h: 0.85, rectRadius: 0.1, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
    s3.addText(s.label, { x: 8.8, y: 2.3 + i * 1.0, w: 2.5, h: 0.6, fontSize: 12, color: MUTED, fontFace: 'Arial', valign: 'middle' });
    s3.addText(s.value, { x: 11, y: 2.3 + i * 1.0, w: 1.2, h: 0.6, fontSize: 22, color: s.color, fontFace: 'Arial', bold: true, align: 'right', valign: 'middle' });
  });

  // ===== SLIDE 4: REPOSITORY =====
  const s4 = pptx.addSlide();
  addGridBg(s4);
  slideHeader(s4, 'PILLAR 1', 'Repository Architecture', TEAL);
  s4.addText('Four-layer architecture for secure EPUB3 and PDF content storage.', { x: 0.8, y: 2.1, w: 8, h: 0.5, fontSize: 14, color: MUTED, fontFace: 'Arial' });

  const repoCards = [
    { title: 'Storage Layer', desc: 'Private RLS-protected bucket', stat: 'book-files' },
    { title: 'Metadata Layer', desc: 'Structured books table', stat: '12+ fields' },
    { title: 'Access Control', desc: 'Per-enterprise RLS isolation', stat: 'Per-tenant' },
    { title: 'Content Layer', desc: 'Chapter-level content', stat: 'book_chapters' },
  ];
  repoCards.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.8 + col * 6.2;
    const y = 3.0 + row * 2.1;
    s4.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.8, h: 1.8, rectRadius: 0.15, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
    s4.addText(c.title, { x: x + 0.3, y: y + 0.2, w: 5, h: 0.4, fontSize: 16, color: FG, fontFace: 'Arial', bold: true });
    s4.addText(c.desc, { x: x + 0.3, y: y + 0.7, w: 5, h: 0.4, fontSize: 11, color: MUTED, fontFace: 'Arial' });
    s4.addText(c.stat, { x: x + 0.3, y: y + 1.2, w: 5, h: 0.3, fontSize: 12, color: TEAL, fontFace: 'Consolas', bold: true });
  });

  // ===== SLIDE 5: SECURITY =====
  const s5 = pptx.addSlide();
  addGridBg(s5);
  slideHeader(s5, 'PILLAR 2', 'Security & Access Control', GREEN);

  const secFeatures = [
    { title: 'Row-Level Security', desc: 'Every table has RLS — data isolated per enterprise' },
    { title: 'Tier-Gated Collections', desc: 'Basic: 2/5 unlocked; Pro/Enterprise: all 5' },
    { title: 'Seat Enforcement', desc: 'Warning at 90%, hard block at 100%' },
    { title: 'Role-Based Access', desc: 'Admin, Compliance Officer, Dept Manager, Staff' },
  ];
  secFeatures.forEach((f, i) => {
    s5.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 2.2 + i * 1.2, w: 5, h: 1.0, rectRadius: 0.1, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
    s5.addText(f.title, { x: 1.1, y: 2.3 + i * 1.2, w: 4.5, h: 0.35, fontSize: 14, color: FG, fontFace: 'Arial', bold: true });
    s5.addText(f.desc, { x: 1.1, y: 2.65 + i * 1.2, w: 4.5, h: 0.35, fontSize: 11, color: MUTED, fontFace: 'Arial' });
  });

  // Tier matrix
  s5.addShape(pptx.ShapeType.roundRect, { x: 6.3, y: 2.2, w: 6.3, h: 5.0, rectRadius: 0.15, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
  s5.addText('Tier Enforcement Matrix', { x: 6.6, y: 2.4, w: 5, h: 0.4, fontSize: 16, color: FG, fontFace: 'Arial', bold: true });
  const headers = ['Feature', 'Basic', 'Pro', 'Enterprise'];
  headers.forEach((h, i) => {
    s5.addText(h, { x: 6.6 + i * 1.5, y: 3.0, w: 1.4, h: 0.4, fontSize: 12, color: [MUTED, MUTED, TEAL, AMBER][i], fontFace: 'Arial', bold: true, align: i === 0 ? 'left' : 'center' });
  });
  const matrixRows = [
    ['Seats', '10', '25', '250+'],
    ['Collections', '2/5', '5/5', '5/5 + Custom'],
    ['AI Queries', '100/mo', '500/mo', 'Unlimited'],
    ['Add-On Builder', '❌', '✅', '✅'],
    ['Multi-Location', '❌', '❌', '✅'],
    ['COUNTER Reports', 'Basic', 'Enhanced', 'Full'],
  ];
  matrixRows.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      s5.addText(cell, { x: 6.6 + ci * 1.5, y: 3.5 + ri * 0.6, w: 1.4, h: 0.45, fontSize: 11, color: ci === 0 ? FG : MUTED, fontFace: 'Arial', align: ci === 0 ? 'left' : 'center' });
    });
  });

  // ===== SLIDE 6: AUTH & ROLES =====
  const s6 = pptx.addSlide();
  addGridBg(s6);
  slideHeader(s6, 'SECURITY', 'Authentication & Roles', GREEN);

  const roles = [
    { role: 'Platform Admin', scope: 'Full system access', color: RED },
    { role: 'Enterprise Admin', scope: 'Manage users, seats, collections', color: AMBER },
    { role: 'Compliance Officer', scope: 'Audit logs, COUNTER, bundles', color: TEAL },
    { role: 'Department Manager', scope: 'Manage department members', color: BLUE },
    { role: 'Staff', scope: 'Read-only content access', color: MUTED },
  ];
  roles.forEach((r, i) => {
    s6.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 2.2 + i * 1.0, w: 5.5, h: 0.85, rectRadius: 0.1, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
    s6.addShape(pptx.ShapeType.rect, { x: 0.8, y: 2.2 + i * 1.0, w: 0.06, h: 0.85, fill: { color: r.color } });
    s6.addText(r.role, { x: 1.2, y: 2.25 + i * 1.0, w: 3.5, h: 0.4, fontSize: 14, color: FG, fontFace: 'Arial', bold: true });
    s6.addText(r.scope, { x: 1.2, y: 2.6 + i * 1.0, w: 4, h: 0.3, fontSize: 11, color: MUTED, fontFace: 'Arial' });
  });

  const authFeats = ['Email + Password Auth', 'SSO / SAML Ready (Phase 2)', 'JWT Session Management', 'Protected Route Guards'];
  authFeats.forEach((f, i) => {
    s6.addShape(pptx.ShapeType.roundRect, { x: 7, y: 2.2 + i * 1.2, w: 5.5, h: 1.0, rectRadius: 0.1, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
    s6.addText(`✓  ${f}`, { x: 7.3, y: 2.2 + i * 1.2, w: 5, h: 1.0, fontSize: 14, color: FG, fontFace: 'Arial', valign: 'middle' });
  });

  // ===== SLIDE 7: METADATA =====
  const s7 = pptx.addSlide();
  addGridBg(s7);
  slideHeader(s7, 'PILLAR 3', 'Metadata Structure', BLUE);

  s7.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 2.2, w: 12, h: 5.0, rectRadius: 0.15, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
  s7.addText('books — table schema', { x: 1.1, y: 2.4, w: 5, h: 0.4, fontSize: 13, color: BLUE, fontFace: 'Consolas', bold: true });

  const schemaHeaders = ['Field', 'Type', 'Example'];
  schemaHeaders.forEach((h, i) => {
    s7.addText(h, { x: 1.1 + i * 3.8, y: 3.0, w: 3.5, h: 0.35, fontSize: 11, color: MUTED, fontFace: 'Arial', bold: true });
  });
  const fields = [
    ['title', 'text', '"Morgan & Mikhail\'s..."'], ['authors', 'text[]', '["Butterworth", ...]'],
    ['publisher', 'text', '"McGraw-Hill"'], ['isbn', 'text', '"978-1-260-..."'],
    ['edition', 'text', '"7th Edition"'], ['published_year', 'int', '2022'],
    ['specialty', 'text', '"Anesthesia"'], ['tags', 'text[]', '["perioperative", ...]'],
    ['file_type', 'text', '"epub" | "pdf"'],
  ];
  fields.forEach((row, ri) => {
    const colors = [TEAL, AMBER, MUTED];
    row.forEach((cell, ci) => {
      s7.addText(cell, { x: 1.1 + ci * 3.8, y: 3.5 + ri * 0.45, w: 3.5, h: 0.4, fontSize: 10, color: colors[ci], fontFace: 'Consolas' });
    });
  });

  // ===== SLIDE 8: AUTOMATION =====
  const s8 = pptx.addSlide();
  addGridBg(s8);
  slideHeader(s8, 'PILLAR 4', 'Automation Workflow', AMBER);
  s8.addText('AI-powered content ingestion pipeline — from file upload to searchable catalog.', { x: 0.8, y: 2.1, w: 8, h: 0.4, fontSize: 14, color: MUTED, fontFace: 'Arial' });

  const autoSteps = [
    { num: '01', title: 'Upload', desc: 'Drag-and-drop\nEPUB or PDF', color: TEAL },
    { num: '02', title: 'AI Extract', desc: 'Gemini extracts\nmetadata & chapters', color: PURPLE },
    { num: '03', title: 'Review', desc: 'Admin reviews\nAI-populated fields', color: AMBER },
    { num: '04', title: 'Tag', desc: 'Auto-detected\nmedical tags', color: GREEN },
    { num: '05', title: 'Publish', desc: 'Book + chapters\nto catalog', color: RED },
  ];
  autoSteps.forEach((s, i) => {
    const x = 0.8 + i * 2.45;
    s8.addShape(pptx.ShapeType.roundRect, { x, y: 3, w: 2.2, h: 3.5, rectRadius: 0.15, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
    s8.addText(s.num, { x, y: 3.3, w: 2.2, h: 0.6, fontSize: 28, color: s.color, fontFace: 'Arial', bold: true, align: 'center' });
    s8.addText(s.title, { x: x + 0.2, y: 4.1, w: 1.8, h: 0.4, fontSize: 14, color: FG, fontFace: 'Arial', bold: true, align: 'center' });
    s8.addText(s.desc, { x: x + 0.2, y: 4.7, w: 1.8, h: 1, fontSize: 11, color: MUTED, fontFace: 'Arial', align: 'center' });
    if (i < 4) s8.addText('→', { x: x + 2.2, y: 4.3, w: 0.25, h: 0.4, fontSize: 16, color: s.color, fontFace: 'Arial', align: 'center' });
  });

  s8.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 6.7, w: 11.5, h: 0.5, rectRadius: 0.1, fill: { color: BG }, line: { color: AMBER, width: 1 } });
  s8.addText('⚡ Graceful Fallback: If AI extraction fails, system falls back to manual entry.', { x: 1.1, y: 6.7, w: 11, h: 0.5, fontSize: 11, color: AMBER, fontFace: 'Arial', valign: 'middle' });

  // ===== SLIDE 9: AI FEATURES =====
  const s9 = pptx.addSlide();
  addGridBg(s9);
  slideHeader(s9, 'AI ENGINE', 'AI-Powered Features', PURPLE);

  const aiStats = [
    { label: 'Model', value: 'Gemini 2.5 Flash' },
    { label: 'Avg Response', value: '<3s' },
    { label: 'Query Logging', value: '100%' },
    { label: 'Scope', value: 'Chapter-only' },
  ];
  aiStats.forEach((s, i) => {
    s9.addShape(pptx.ShapeType.roundRect, { x: 0.8 + i * 3.1, y: 2.2, w: 2.8, h: 1.0, rectRadius: 0.1, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
    s9.addText(s.value, { x: 0.8 + i * 3.1, y: 2.3, w: 2.8, h: 0.5, fontSize: 16, color: PURPLE, fontFace: 'Arial', bold: true, align: 'center' });
    s9.addText(s.label, { x: 0.8 + i * 3.1, y: 2.8, w: 2.8, h: 0.3, fontSize: 10, color: MUTED, fontFace: 'Arial', align: 'center' });
  });

  const aiFeatures = [
    { title: 'Chapter Summaries', desc: 'AI generates concise summaries for quick scanning', color: PURPLE },
    { title: 'Free-Form Q&A', desc: 'Ask questions — AI answers from chapter content only', color: TEAL },
    { title: 'Metadata Extraction', desc: 'Auto-extract title, authors, ISBN, specialty, tags', color: AMBER },
    { title: 'Content Guardrails', desc: 'Strictly scoped to repository — no hallucinated data', color: RED },
  ];
  aiFeatures.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.8 + col * 6.2;
    const y = 3.6 + row * 1.9;
    s9.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.8, h: 1.6, rectRadius: 0.1, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
    s9.addShape(pptx.ShapeType.rect, { x, y, w: 5.8, h: 0.06, fill: { color: f.color } });
    s9.addText(f.title, { x: x + 0.3, y: y + 0.2, w: 5, h: 0.4, fontSize: 16, color: FG, fontFace: 'Arial', bold: true });
    s9.addText(f.desc, { x: x + 0.3, y: y + 0.7, w: 5, h: 0.6, fontSize: 12, color: MUTED, fontFace: 'Arial' });
  });

  // ===== SLIDE 10: CATALOG =====
  const s10 = pptx.addSlide();
  addGridBg(s10);
  slideHeader(s10, 'PILLAR 5', 'Catalog & Search', PURPLE);

  const scores = [
    { label: 'Title Match', pts: '30 pts', width: 4.5, color: PURPLE },
    { label: 'Tag Match', pts: '20 pts', width: 3, color: TEAL },
    { label: 'Content Keyword', pts: '5 pts', width: 0.8, color: AMBER },
  ];
  scores.forEach((s, i) => {
    const y = 2.5 + i * 0.9;
    s10.addText(s.label, { x: 0.8, y, w: 2, h: 0.3, fontSize: 12, color: FG, fontFace: 'Arial' });
    s10.addText(s.pts, { x: 3.5, y, w: 1.2, h: 0.3, fontSize: 12, color: s.color, fontFace: 'Consolas', bold: true, align: 'right' });
    s10.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: y + 0.35, w: 4.5, h: 0.2, rectRadius: 0.1, fill: { color: BORDER } });
    s10.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: y + 0.35, w: s.width, h: 0.2, rectRadius: 0.1, fill: { color: s.color } });
  });

  const catFeatures = [
    { title: 'Library Catalog', desc: 'Grid of book cards with covers and specialty badges', color: PURPLE },
    { title: 'AI Chapter Q&A', desc: 'Chapter-scoped summaries and free-form Q&A', color: TEAL },
    { title: 'Full Reader', desc: 'Chapter reader with TOC sidebar and AI panel', color: AMBER },
    { title: 'AI Guardrails', desc: 'No open-web queries — repository content only', color: GREEN },
  ];
  catFeatures.forEach((f, i) => {
    s10.addShape(pptx.ShapeType.roundRect, { x: 6.3, y: 2.2 + i * 1.3, w: 6.3, h: 1.1, rectRadius: 0.1, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
    s10.addShape(pptx.ShapeType.rect, { x: 6.3, y: 2.2 + i * 1.3, w: 0.06, h: 1.1, fill: { color: f.color } });
    s10.addText(f.title, { x: 6.7, y: 2.3 + i * 1.3, w: 5.5, h: 0.4, fontSize: 15, color: FG, fontFace: 'Arial', bold: true });
    s10.addText(f.desc, { x: 6.7, y: 2.7 + i * 1.3, w: 5.5, h: 0.4, fontSize: 11, color: MUTED, fontFace: 'Arial' });
  });

  // ===== SLIDE 11: COMPLIANCE COLLECTIONS =====
  const s11 = pptx.addSlide();
  addGridBg(s11);
  slideHeader(s11, 'CONTENT', 'Compliance Collections', AMBER);

  const collections = [
    { name: 'Clinical Anesthesia', books: '3 titles', tier: 'Basic', color: TEAL },
    { name: 'Perioperative Nursing', books: '2 titles', tier: 'Basic', color: TEAL },
    { name: 'Surgical Standards', books: '4 titles', tier: 'Pro', color: AMBER },
    { name: 'Emergency Medicine', books: '3 titles', tier: 'Pro', color: AMBER },
    { name: 'Regulatory & Compliance', books: '5 titles', tier: 'Enterprise', color: PURPLE },
  ];
  collections.forEach((c, i) => {
    s11.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 2.2 + i * 1.0, w: 6, h: 0.85, rectRadius: 0.1, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
    s11.addShape(pptx.ShapeType.rect, { x: 0.8, y: 2.2 + i * 1.0, w: 0.06, h: 0.85, fill: { color: c.color } });
    s11.addText(c.name, { x: 1.2, y: 2.25 + i * 1.0, w: 3.5, h: 0.4, fontSize: 14, color: FG, fontFace: 'Arial', bold: true });
    s11.addText(`${c.books} • ${c.tier}`, { x: 1.2, y: 2.6 + i * 1.0, w: 3.5, h: 0.3, fontSize: 11, color: c.color, fontFace: 'Arial' });
  });

  const tierAccess = [
    { tier: 'Basic', unlocked: '2 / 5', color: TEAL },
    { tier: 'Pro', unlocked: '5 / 5', color: AMBER },
    { tier: 'Enterprise', unlocked: '5 / 5 + Custom', color: PURPLE },
  ];
  tierAccess.forEach((t, i) => {
    s11.addShape(pptx.ShapeType.roundRect, { x: 7.5, y: 2.2 + i * 1.7, w: 5, h: 1.4, rectRadius: 0.15, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
    s11.addShape(pptx.ShapeType.rect, { x: 7.5, y: 2.2 + i * 1.7, w: 0.06, h: 1.4, fill: { color: t.color } });
    s11.addText(t.tier, { x: 7.9, y: 2.35 + i * 1.7, w: 4, h: 0.5, fontSize: 18, color: t.color, fontFace: 'Arial', bold: true });
    s11.addText(t.unlocked, { x: 7.9, y: 2.85 + i * 1.7, w: 4, h: 0.5, fontSize: 24, color: FG, fontFace: 'Arial', bold: true });
  });

  // ===== SLIDE 12: ENTERPRISE DASHBOARD =====
  const s12 = pptx.addSlide();
  addGridBg(s12);
  slideHeader(s12, 'ANALYTICS', 'Enterprise Dashboard', TEAL);

  const dashMetrics = [
    { label: 'Licensed Seats', value: '250', sub: '218 active (87%)', color: TEAL },
    { label: 'AI Queries/Mo', value: '1,247', sub: 'Avg 5.7/user', color: PURPLE },
    { label: 'Books Accessed', value: '34/42', sub: '81% utilization', color: AMBER },
    { label: 'Collections', value: '5/5', sub: 'All active', color: GREEN },
  ];
  dashMetrics.forEach((m, i) => {
    s12.addShape(pptx.ShapeType.roundRect, { x: 0.8 + i * 3.1, y: 2.2, w: 2.8, h: 1.8, rectRadius: 0.1, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
    s12.addText(m.label, { x: 0.8 + i * 3.1, y: 2.3, w: 2.8, h: 0.3, fontSize: 10, color: MUTED, fontFace: 'Arial', align: 'center' });
    s12.addText(m.value, { x: 0.8 + i * 3.1, y: 2.7, w: 2.8, h: 0.6, fontSize: 26, color: m.color, fontFace: 'Arial', bold: true, align: 'center' });
    s12.addText(m.sub, { x: 0.8 + i * 3.1, y: 3.4, w: 2.8, h: 0.3, fontSize: 10, color: MUTED, fontFace: 'Arial', align: 'center' });
  });

  const dashWidgets = [
    { title: 'Usage Trends', desc: 'Weekly/monthly access patterns', icon: '📊' },
    { title: 'Top Titles', desc: 'Most accessed books ranked', icon: '📚' },
    { title: 'Department Breakdown', desc: 'Usage by department', icon: '🏥' },
    { title: 'Alerts & Warnings', desc: 'Seat utilization alerts', icon: '⚠️' },
  ];
  dashWidgets.forEach((w, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.8 + col * 6.2;
    const y = 4.5 + row * 1.5;
    s12.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.8, h: 1.3, rectRadius: 0.1, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
    s12.addText(`${w.icon}  ${w.title}`, { x: x + 0.3, y: y + 0.15, w: 5, h: 0.5, fontSize: 14, color: FG, fontFace: 'Arial', bold: true });
    s12.addText(w.desc, { x: x + 0.3, y: y + 0.7, w: 5, h: 0.4, fontSize: 11, color: MUTED, fontFace: 'Arial' });
  });

  // ===== SLIDE 13: REPORTING =====
  const s13 = pptx.addSlide();
  addGridBg(s13);
  slideHeader(s13, 'PILLAR 6', 'Reporting & Audit', RED);

  const repCards = [
    { title: 'COUNTER 5.1 Reports', items: 'TR_B1 — Book Master Report\nTR_B3 — Book Usage by Month', color: RED },
    { title: 'CSV Export', items: 'One-click download\nLibrary system compatible', color: TEAL },
    { title: 'Enterprise Dashboard', items: 'Seat utilization tracking\nCollection usage stats', color: AMBER },
    { title: 'Audit Logs', items: 'Every action tracked\nTimestamps, IPs, targets', color: GREEN },
  ];
  repCards.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.8 + col * 6.2;
    const y = 2.5 + row * 2.3;
    s13.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.8, h: 2.0, rectRadius: 0.15, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
    s13.addShape(pptx.ShapeType.rect, { x, y, w: 0.06, h: 2.0, fill: { color: c.color } });
    s13.addText(c.title, { x: x + 0.4, y: y + 0.15, w: 5, h: 0.4, fontSize: 16, color: FG, fontFace: 'Arial', bold: true });
    s13.addText(c.items, { x: x + 0.4, y: y + 0.65, w: 5, h: 1.2, fontSize: 11, color: MUTED, fontFace: 'Arial', lineSpacingMultiple: 1.4 });
  });

  ['usage_events', 'ai_query_logs', 'audit_logs'].forEach((t, i) => {
    s13.addShape(pptx.ShapeType.roundRect, { x: 0.8 + i * 3, y: 7.0, w: 2.6, h: 0.35, rectRadius: 0.1, fill: { color: CARD_BG }, line: { color: BORDER, width: 1 } });
    s13.addText(`→ ${t}`, { x: 0.8 + i * 3, y: 7.0, w: 2.6, h: 0.35, fontSize: 10, color: AMBER, fontFace: 'Consolas', align: 'center', valign: 'middle' });
  });

  // ===== SLIDE 14: LICENSING =====
  const s14 = pptx.addSlide();
  addGridBg(s14);
  slideHeader(s14, 'PRICING', 'Institutional Licensing', PURPLE);
  s14.addText('Three tiers — priced per bed count, not per user', { x: 0.8, y: 2.1, w: 8, h: 0.4, fontSize: 14, color: MUTED, fontFace: 'Arial' });

  const tiers = [
    { name: 'Basic', features: ['Up to 10 seats', '2 compliance bundles', '100 AI queries/mo', 'Basic reports', 'Email support'], color: TEAL },
    { name: 'Pro', features: ['Up to 25 seats', 'All 5 bundles', '500 AI queries/mo', 'Enhanced reporting', 'Add-on builder', 'Priority support'], color: AMBER, highlight: true },
    { name: 'Enterprise', features: ['250+ seats', 'Custom bundles', 'Unlimited AI', 'Full COUNTER 5.1', 'Multi-location', 'SSO/SAML', 'Dedicated CSM'], color: PURPLE },
  ];
  tiers.forEach((t, i) => {
    const x = 0.8 + i * 4.1;
    const borderColor = t.highlight ? AMBER : BORDER;
    s14.addShape(pptx.ShapeType.roundRect, { x, y: 2.8, w: 3.8, h: 4.5, rectRadius: 0.15, fill: { color: CARD_BG }, line: { color: borderColor, width: t.highlight ? 2 : 1 } });
    if (t.highlight) {
      s14.addText('MOST POPULAR', { x, y: 2.9, w: 3.8, h: 0.3, fontSize: 9, color: AMBER, fontFace: 'Arial', align: 'center', charSpacing: 3, bold: true });
    }
    s14.addText(t.name, { x: x + 0.3, y: 3.3, w: 3.2, h: 0.5, fontSize: 22, color: t.color, fontFace: 'Arial', bold: true });
    s14.addText('Contact Sales', { x: x + 0.3, y: 3.8, w: 3.2, h: 0.3, fontSize: 12, color: MUTED, fontFace: 'Arial' });
    t.features.forEach((f, fi) => {
      s14.addText(`✓  ${f}`, { x: x + 0.3, y: 4.3 + fi * 0.4, w: 3.2, h: 0.35, fontSize: 11, color: FG, fontFace: 'Arial' });
    });
  });

  s14.addText('All plans include HIPAA-ready infrastructure, encrypted storage, and audit logging', { x: 1, y: 7.1, w: 11, h: 0.3, fontSize: 11, color: MUTED, fontFace: 'Arial', align: 'center' });

  // ===== SLIDE 15: CLOSING =====
  const s15 = pptx.addSlide();
  addGridBg(s15);
  s15.addShape(pptx.ShapeType.ellipse, { x: 8, y: -1, w: 5, h: 5, fill: { color: TEAL, transparency: 92 } });

  s15.addText([
    { text: 'Infrastructure\n', options: { color: FG, fontSize: 48, bold: true, fontFace: 'Arial' } },
    { text: 'Built to Scale', options: { color: TEAL, fontSize: 48, bold: true, fontFace: 'Arial' } },
  ], { x: 1, y: 0.8, w: 11, h: 2, align: 'center', lineSpacingMultiple: 1.15 });

  s15.addText('The hardest 80% is complete. The remaining 20% is UI polish and client-specific configuration.', { x: 2.5, y: 2.9, w: 8, h: 0.6, fontSize: 15, color: MUTED, fontFace: 'Arial', align: 'center' });

  const checks = [
    'PostgreSQL RLS for tenant isolation', 'AI-powered ingestion with Gemini',
    'COUNTER 5.1 compliant reporting', 'Tier-gated collections + seat enforcement',
    'Chapter-scoped AI Q&A — internal only', 'Full audit trail with governance logging',
  ];
  checks.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    s15.addText(`✅  ${c}`, { x: 2.5 + col * 4.5, y: 3.8 + row * 0.55, w: 4.2, h: 0.45, fontSize: 13, color: FG, fontFace: 'Arial' });
  });

  s15.addShape(pptx.ShapeType.roundRect, { x: 2.5, y: 5.7, w: 8, h: 0.7, rectRadius: 0.15, fill: { color: BG }, line: { color: TEAL, width: 1 } });
  s15.addText([
    { text: 'Next Steps: ', options: { color: TEAL, bold: true, fontSize: 14 } },
    { text: 'IdP details for SSO → Custom pricing per bed count → Onboarding', options: { color: MUTED, fontSize: 14 } },
  ], { x: 2.8, y: 5.7, w: 7.5, h: 0.7, fontFace: 'Arial', valign: 'middle' });

  s15.addText('Compliance Collections AI — Rittenhouse • Sarasota, FL • March 2026', { x: 1, y: 6.8, w: 11, h: 0.4, fontSize: 12, color: MUTED, fontFace: 'Arial', align: 'center' });

  // ===== EXPORT =====
  return pptx.writeFile({ fileName: 'Compliance-Collections-AI-Sarasota-Demo.pptx' });
}
