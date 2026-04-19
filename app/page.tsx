'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import GridScan from '@/components/ui/GridScan';
import HowItWorksSteps from '@/components/landing/HowItWorksSteps';
import DemoVideoSection from '@/components/landing/DemoVideoSection';
import LogosMarqueeSection from '@/components/landing/LogosMarqueeSection';
import LiveStatsSection from '@/components/landing/LiveStatsSection';
import './waitlist/waitlist.css';

const testimonials = [
  {
    name: 'Astra Vance',
    role: 'Venture Strategist',
    content: 'The Blitz rounds are a game-changer. The millisecond precision from oracle pricing makes Initnomo feel like a professional exchange with decentralized confidence.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Lyra Sterling',
    role: 'DeFi Architect',
    content: 'Fast rounds are perfect for active trading. Clean settlement and transparent history give confidence to increase size.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Kai Zen',
    role: 'Algo Developer',
    content: 'Instant house-balance flow removes chain latency pain. It finally feels built for high-frequency prediction behavior.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  },
];

const faqs = [
  {
    question: 'How does the house balance work?',
    answer: 'You deposit through the platform treasury flow, then funds reflect in your game balance for fast round participation.',
  },
  {
    question: 'What assets can I trade?',
    answer: 'Initnomo supports prediction rounds against oracle-backed markets surfaced in the trade interface.',
  },
  {
    question: 'How are rounds settled?',
    answer: 'At expiry, round outcomes are resolved from oracle prices and payouts are credited to your platform balance.',
  },
  {
    question: 'Where can I review details?',
    answer: 'Use the Pitch Deck for product overview and your in-app pages for history, rewards, and profile performance.',
  },
];

export default function HomePage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-layout h-full overflow-y-auto overflow-x-hidden scroll-smooth selection:bg-purple-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <GridScan
          sensitivity={0.01}
          lineThickness={1}
          linesColor="#14141a"
          gridScale={0.1}
          scanColor="#FF9FFC"
          scanOpacity={0.03}
          scanDuration={16.0}
          enablePost
          bloomIntensity={0.05}
          chromaticAberration={0.0001}
          noiseIntensity={0.01}
        />
      </div>

      <section id="hero-top" className="min-h-screen flex flex-col justify-center relative overflow-hidden px-4 sm:px-6 lg:px-20">
        <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-10 sm:gap-12 lg:gap-24 relative isolate">
          <div className="relative z-0 flex flex-col justify-center select-none mix-blend-difference">
            <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } } }} className="flex flex-wrap lg:flex-nowrap justify-center lg:justify-start">
              {Array.from('INITNOMO').map((letter, index) => (
                <motion.h1 key={index} variants={{ hidden: { opacity: 0, x: -50, filter: 'blur(20px)' }, visible: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { type: 'spring', damping: 20, stiffness: 100 } } }} className="text-[18vw] sm:text-[14vw] lg:text-[10rem] font-black leading-[0.8] tracking-tighter text-white" style={{ fontFamily: 'var(--font-orbitron)' }}>
                  {letter}
                </motion.h1>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ x: 100, opacity: 0, filter: 'blur(10px)' }} animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="relative z-20 flex flex-col justify-center items-center lg:items-start lg:pl-4 -mt-8 lg:mt-0 gap-6 lg:gap-8 text-center lg:text-left">
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }} className="text-2xl lg:text-5xl font-bold text-white tracking-tight">
              Predict the next tick.
            </motion.h2>
            <p className="text-sm lg:text-base text-white/45 font-medium max-w-md leading-relaxed mx-auto lg:mx-0">
              Initnomo is live — connect your wallet, fund your house balance, and trade with oracle-backed prices.
            </p>
            <button
              type="button"
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-black rounded-full font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-gray-200 transition-colors shadow-[0_20px_50px_-15px_rgba(255,255,255,0.25)]"
              aria-label="Scroll to product demo video"
            >
              Check demo
            </button>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="relative py-16 sm:py-24 lg:py-32 bg-[#02040a] overflow-visible">
        <div className="section-content relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14 lg:mb-16 px-1">
            <div className="text-white/25 font-mono text-[9px] sm:text-[10px] mb-3 sm:mb-4 uppercase tracking-[0.2em] sm:tracking-[0.35em] flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_purple] shrink-0" />
              How It Works
            </div>
            <h2 className="text-[1.65rem] leading-[1.05] min-[400px]:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-4 sm:mb-6 uppercase px-1" style={{ fontFamily: 'var(--font-orbitron)' }}>
              How <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">Initnomo works</span>
            </h2>
            <p className="text-white/35 max-w-2xl mx-auto text-[11px] sm:text-sm font-bold uppercase tracking-wide sm:tracking-widest leading-relaxed px-2">
              Connect, deposit, predict, and settle in a fast hybrid flow powered by oracle pricing and secure treasury rails.
            </p>
          </div>
          <HowItWorksSteps />
        </div>
      </section>

      <DemoVideoSection />
      <LogosMarqueeSection />
      <LiveStatsSection />

      <section>
        <div className="section-content">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black tracking-tighter mb-6">FEEDBACKS</h2>
            <p className="text-white/40 text-lg font-medium">Trusted by traders using the next generation prediction experience.</p>
          </div>
        </div>
        <div className="testimonials-slider-container">
          <div className="testimonial-track" style={{ transform: `translateX(calc(${(testimonials.length - 1) / 2} * var(--testimonial-step) - ${activeIdx} * var(--testimonial-step)))` }}>
            {testimonials.map((t, i) => (
              <div key={i} className={`testimonial-card-premium ${i === activeIdx ? 'active' : ''}`}>
                <div className="text-purple-500 text-6xl font-serif mb-8 opacity-20">"</div>
                <p className="text-xl italic text-white/60 mb-10 font-medium leading-relaxed">{t.content}</p>
                <div className="flex items-center gap-5">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-lg shadow-purple-500/20" />
                  <div>
                    <div className="font-black text-sm tracking-[0.2em] uppercase">{t.name}</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.1em] text-purple-500/60 mt-1">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black/20">
        <div className="section-content">
          <div className="faq-grid">
            <div className="faq-title-area">
              <div className="text-purple-500 font-black uppercase tracking-[0.4em] text-xs mb-8">FAQ</div>
              <h2 className="text-6xl font-black tracking-tighter mb-8 leading-[0.9]">Frequently<br />asked<br />questions</h2>
            </div>
            <div className="faq-accordion-list">
              {faqs.map((faq, i) => (
                <div key={i} className={`faq-item ${activeFaq === i ? 'active' : ''}`} onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                  <div className="faq-question-wrap">
                    <h4 className="faq-question">{faq.question}</h4>
                    <div className="faq-icon">+</div>
                  </div>
                  <div className="faq-answer">
                    <p className="faq-answer-text">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="cta-card">
          <div className="cta-glow" />
          <h2 className="cta-title">Ready to trade the future with decentralized precision?</h2>
          <Link href="/trade" className="cta-button" aria-label="Start trading">Start now</Link>
        </motion.div>
      </section>

      <footer className="py-24 px-10 border-t border-white/5 bg-black relative z-10 w-full overflow-hidden">
        <div className="huge-footer-logo">INITNOMO</div>
        <div className="footer-meta">
          <div className="footer-meta-item">2026 © All rights reserved</div>
          <div className="footer-link-group">
            <a href="https://github.com/0xamaan-dev/Initnomo" target="_blank" rel="noopener noreferrer" className="footer-meta-item">GitHub</a>
            <a href="https://docs.google.com/presentation/d/1cZuB4i57buCZ2ZyNFNVLxY-qlLUSyTV33J7doVjnMi8/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="footer-meta-item">Pitch Deck</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
