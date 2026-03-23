import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScaledSlide } from '@/components/presentation/ScaledSlide';
import { TitleSlide } from '@/components/presentation/slides/TitleSlide';
import { AgendaSlide } from '@/components/presentation/slides/AgendaSlide';
import { ArchitectureSlide } from '@/components/presentation/slides/ArchitectureSlide';
import { RepositorySlide } from '@/components/presentation/slides/RepositorySlide';
import { SecuritySlide } from '@/components/presentation/slides/SecuritySlide';
import { AuthSlide } from '@/components/presentation/slides/AuthSlide';
import { MetadataSlide } from '@/components/presentation/slides/MetadataSlide';
import { AutomationSlide } from '@/components/presentation/slides/AutomationSlide';
import { AIFeaturesSlide } from '@/components/presentation/slides/AIFeaturesSlide';
import { CatalogSlide } from '@/components/presentation/slides/CatalogSlide';
import { ComplianceSlide } from '@/components/presentation/slides/ComplianceSlide';
import { EnterpriseDashSlide } from '@/components/presentation/slides/EnterpriseDashSlide';
import { ReportingSlide } from '@/components/presentation/slides/ReportingSlide';
import { LicensingSlide } from '@/components/presentation/slides/LicensingSlide';
import { ClosingSlide } from '@/components/presentation/slides/ClosingSlide';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Grid3X3, Download } from 'lucide-react';
import { generatePptx } from '@/lib/generatePptx';

const slides = [
  TitleSlide,          // 1
  AgendaSlide,         // 2
  ArchitectureSlide,   // 3
  RepositorySlide,     // 4
  SecuritySlide,       // 5
  AuthSlide,           // 6
  MetadataSlide,       // 7
  AutomationSlide,     // 8
  AIFeaturesSlide,     // 9
  CatalogSlide,        // 10
  ComplianceSlide,     // 11
  EnterpriseDashSlide, // 12
  ReportingSlide,      // 13
  LicensingSlide,      // 14
  ClosingSlide,        // 15
];

const slideNames = [
  'Title',
  'Agenda',
  'Platform Architecture',
  'Repository',
  'Security & RLS',
  'Authentication & Roles',
  'Metadata Structure',
  'Automation Workflow',
  'AI-Powered Features',
  'Catalog & Search',
  'Compliance Collections',
  'Enterprise Dashboard',
  'Reporting & Audit',
  'Institutional Licensing',
  'Closing',
];

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export default function Presentation() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [cursorHidden, setCursorHidden] = useState(false);

  const goTo = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
    setShowGrid(false);
  }, [current]);

  const next = useCallback(() => {
    if (current < slides.length - 1) { setDirection(1); setCurrent(c => c + 1); }
  }, [current]);

  const prev = useCallback(() => {
    if (current > 0) { setDirection(-1); setCurrent(c => c - 1); }
  }, [current]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      if (e.key === 'f' || e.key === 'F5') { e.preventDefault(); toggleFullscreen(); }
      if (e.key === 'Escape' && showGrid) { setShowGrid(false); }
      if (e.key === 'g' || e.key === 'G') { setShowGrid(s => !s); }
    };
    window.addEventListener('keydown', handleKey);
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, [next, prev, toggleFullscreen, showGrid]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const resetCursor = () => {
      setCursorHidden(false);
      clearTimeout(timer);
      timer = setTimeout(() => setCursorHidden(true), 3000);
    };
    window.addEventListener('mousemove', resetCursor);
    return () => { window.removeEventListener('mousemove', resetCursor); clearTimeout(timer); };
  }, []);

  const SlideComponent = slides[current];

  if (showGrid) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[hsl(222,47%,4%)] overflow-auto p-8" style={{ cursor: cursorHidden && isFullscreen ? 'none' : 'default' }}>
        <div className="flex items-center justify-between mb-8 px-4">
          <h2 className="text-[hsl(210,40%,92%)] text-2xl font-bold">All Slides</h2>
          <button onClick={() => setShowGrid(false)} className="text-[hsl(215,20%,55%)] hover:text-[hsl(210,40%,92%)] transition-colors text-sm">
            Press G or ESC to close
          </button>
        </div>
        <div className="grid grid-cols-5 gap-5 max-w-[1800px] mx-auto">
          {slides.map((Slide, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 aspect-video ${
                i === current ? 'border-[hsl(174,72%,46%)] shadow-[0_0_20px_-5px_hsl(174,72%,46%/0.4)]' : 'border-[hsl(220,20%,16%)] hover:border-[hsl(220,20%,25%)]'
              }`}
            >
              <div className="w-full h-full overflow-hidden" style={{ transform: 'scale(0.18)', transformOrigin: 'top left', width: '555%', height: '555%' }}>
                <Slide />
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[hsl(222,47%,4%)] to-transparent p-2">
                <span className="text-[hsl(210,40%,92%)] text-xs font-medium">{i + 1}. {slideNames[i]}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[hsl(222,47%,4%)] select-none"
      style={{ cursor: cursorHidden && isFullscreen ? 'none' : 'default' }}
    >
      <div className="absolute inset-0">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            <ScaledSlide>
              <SlideComponent />
            </ScaledSlide>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: cursorHidden && isFullscreen ? 0 : 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 bg-[hsl(222,40%,9%)/0.9] backdrop-blur-xl border border-[hsl(220,20%,16%)] rounded-full px-4 py-2 shadow-2xl">
          <button onClick={prev} disabled={current === 0} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[hsl(220,20%,16%)] disabled:opacity-30 transition-all text-[hsl(210,40%,92%)]">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1 px-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? 'w-5 h-2 bg-[hsl(174,72%,46%)]' : 'w-2 h-2 bg-[hsl(220,20%,25%)] hover:bg-[hsl(220,20%,35%)]'
                }`}
              />
            ))}
          </div>
          <button onClick={next} disabled={current === slides.length - 1} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[hsl(220,20%,16%)] disabled:opacity-30 transition-all text-[hsl(210,40%,92%)]">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="w-px h-5 bg-[hsl(220,20%,20%)] mx-1" />
          <span className="text-[13px] font-mono text-[hsl(215,20%,45%)] w-14 text-center">{current + 1}/{slides.length}</span>
          <button onClick={() => setShowGrid(true)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[hsl(220,20%,16%)] transition-all text-[hsl(210,40%,92%)]" title="Grid view (G)">
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => generatePptx()} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[hsl(220,20%,16%)] transition-all text-[hsl(38,95%,55%)]" title="Download .pptx">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={toggleFullscreen} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[hsl(220,20%,16%)] transition-all text-[hsl(174,72%,46%)]" title="Fullscreen (F)">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>

      {/* Slide name tooltip */}
      <motion.div
        className="absolute top-6 left-1/2 -translate-x-1/2 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: cursorHidden && isFullscreen ? 0 : 1 }}
      >
        <div className="bg-[hsl(222,40%,9%)/0.8] backdrop-blur-xl border border-[hsl(220,20%,16%)] rounded-full px-5 py-2 text-[hsl(210,40%,92%)] text-[14px] font-medium">
          {slideNames[current]}
        </div>
      </motion.div>
    </div>
  );
}
