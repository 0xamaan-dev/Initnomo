'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SLIDES = [
  {
    id: 'advisor',
    src: '/logos/Lucas Advisor.JPG',
    alt: 'Advisor banner',
    badge: 'Confirmed',
    imgStyle: { filter: 'blur(8px)', transform: 'scale(1.05)' } as React.CSSProperties,
    href: null,
  },
  {
    id: 'partnership',
    src: '/logos/push-initnomo-partnership-banner.png',
    alt: 'Strategic partnership banner',
    badge: 'Confirmed',
    imgStyle: undefined,
    href: null,
  },
  {
    id: 'coinzaar',
    src: '/logos/InitnomoPartnershipCoinzaarLabs.png',
    alt: 'Strategic partnership banner',
    badge: 'Confirmed',
    imgStyle: undefined,
    href: null,
  },
];

const INTERVAL_MS = 4500;

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

export function SocialProofCarousel() {
  const [[index, dir], setPage] = useState([0, 0]);

  const go = useCallback((next: number, direction: number) => {
    setPage([((next % SLIDES.length) + SLIDES.length) % SLIDES.length, direction]);
  }, []);

  const next = useCallback(() => go(index + 1, 1), [go, index]);
  const prev = useCallback(() => go(index - 1, -1), [go, index]);

  useEffect(() => {
    const id = setInterval(next, INTERVAL_MS);
    return () => clearInterval(id);
  }, [next]);

  const slide = SLIDES[index];

  return (
    <div className="relative z-10 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"
      >
        <div className="relative overflow-hidden rounded-3xl" style={{ isolation: 'isolate' }}>
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={slide.id}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 280, damping: 30, mass: 0.8 }}
            >
              <div className="advisor-card">
                <img src={slide.src} alt={slide.alt} className="advisor-card-photo" style={slide.imgStyle} />
                <div className="advisor-card-badge">
                  <span className="advisor-card-badge-dot" />
                  {slide.badge}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <button onClick={prev} aria-label="Previous" className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 border border-white/10 text-white/60 hover:text-white hover:bg-black/80 backdrop-blur-sm transition-all duration-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button onClick={next} aria-label="Next" className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 border border-white/10 text-white/60 hover:text-white hover:bg-black/80 backdrop-blur-sm transition-all duration-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          {SLIDES.map((s, i) => (
            <button key={s.id} onClick={() => go(i, i > index ? 1 : -1)} aria-label={`Go to slide ${i + 1}`} className="transition-all duration-300">
              <span className={`block rounded-full transition-all duration-300 ${i === index ? 'w-6 h-2 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`} />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
