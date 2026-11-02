import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WORDS = [
  'Namaste',
  'Heavyweight',
  '220 GSM',
  'Crafted in India',
  'Everyday Menswear',
  'funkyfox.',
];

export default function WordsPreloader() {
  const [index, setIndex] = React.useState(0);
  const [dimension, setDimension] = React.useState({ width: 0, height: 0 });
  const [showPreloader, setShowPreloader] = React.useState(false);

  React.useEffect(() => {
    // Only show on first visit per session
    const hasSeen = sessionStorage.getItem('funky_fox_intro_seen');
    if (hasSeen) {
      return;
    }

    setShowPreloader(true);
    setDimension({ width: window.innerWidth, height: window.innerHeight });

    const handleResize = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (!showPreloader) return;

    if (index === WORDS.length - 1) {
      // Exit after the final brand word
      const finishTimer = setTimeout(() => {
        setShowPreloader(false);
        sessionStorage.setItem('funky_fox_intro_seen', 'true');
      }, 700);
      return () => clearTimeout(finishTimer);
    }

    const timer = setTimeout(
      () => {
        setIndex((prev) => prev + 1);
      },
      index === 0 ? 800 : 220
    );

    return () => clearTimeout(timer);
  }, [index, showPreloader]);

  if (!showPreloader) return null;

  // Elastic SVG curve paths (Dennis Snellenberg / Skiper8 liquid curtain)
  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${
    dimension.height + 300
  } 0 ${dimension.height} L0 0`;

  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${
    dimension.height
  } 0 ${dimension.height} L0 0`;

  const slideUp = {
    initial: { top: 0 },
    exit: {
      top: '-100vh',
      transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] as [number, number, number, number], delay: 0.1 },
    },
  };

  const curve = {
    initial: {
      d: initialPath,
      transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] as [number, number, number, number] },
    },
    exit: {
      d: targetPath,
      transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] as [number, number, number, number] },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {showPreloader && (
        <motion.div
          key="skiper8-preloader"
          variants={slideUp}
          initial="initial"
          exit="exit"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#141414] text-white overflow-hidden pointer-events-auto select-none"
        >
          {dimension.width > 0 && (
            <>
              {/* Word Cycling Display */}
              <div className="relative z-10 flex items-center gap-3 px-6">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E87535] animate-pulse" />
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white"
                >
                  {WORDS[index]}
                </motion.p>
              </div>

              {/* Elastic Liquid SVG Curtain Curve */}
              <svg
                className="absolute top-0 left-0 w-full pointer-events-none fill-[#141414]"
                style={{ height: 'calc(100vh + 300px)' }}
              >
                <motion.path variants={curve} initial="initial" exit="exit" />
              </svg>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

