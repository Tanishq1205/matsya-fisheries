import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function Preloader({
  onComplete,
  logoSrc = '/images/matsya-logo.png',
}) {
  const containerRef = useRef(null);
  const waveTrackRef = useRef(null);
  const wave1Ref = useRef(null);
  const wave2Ref = useRef(null);
  const glowFlashRef = useRef(null);
  const logoWrapperRef = useRef(null);
  const subtextRef = useRef(null);

  const isLoadedRef = useRef(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // 1. Force browser to start at the top on reload (disable scroll memory)
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // 2. Lock page scroll across desktop and mobile devices
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const restoreScroll = () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };

    // 3. Detect when assets/images/DOM finish loading
    const handleLoad = () => {
      isLoadedRef.current = true;
    };

    if (document.readyState === 'complete') {
      isLoadedRef.current = true;
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Safety fallback: allow transition after 2.4s on fast connections
    const timer = setTimeout(() => {
      isLoadedRef.current = true;
    }, 2400);

    // 4. Setup Stroke Dash Arrays for drawing effect
    const path1 = wave1Ref.current;
    const path2 = wave2Ref.current;

    if (path1 && path2) {
      const len1 = path1.getTotalLength();
      const len2 = path2.getTotalLength();

      gsap.set(path1, { strokeDasharray: len1, strokeDashoffset: len1 });
      gsap.set(path2, { strokeDasharray: len2, strokeDashoffset: len2 });
    }

    // 5. Fluid Wave Cycle Animation
    const runWaveCycle = () => {
      const cycleTl = gsap.timeline({
        onComplete: () => {
          if (!isLoadedRef.current) {
            // Re-run the tide loop if page is still loading
            gsap.to([path1, path2], {
              opacity: 0.3,
              duration: 0.3,
              onComplete: () => {
                gsap.set([path1, path2], { opacity: 1 });
                runWaveCycle();
              },
            });
          } else {
            // Once ready -> Trigger Golden Pop
            triggerLogoPop();
          }
        },
      });

      // Wave 1 draws in from the left
      cycleTl.to(path1, {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: 'power2.inOut',
      }, 0);

      // Wave 2 draws in from the right with gentle offset
      cycleTl.to(path2, {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: 'power2.inOut',
      }, 0.15);

      // Micro floating wave motion
      cycleTl.to(waveTrackRef.current, {
        scaleY: 1.15,
        duration: 0.7,
        yoyo: true,
        repeat: 1,
        ease: 'sine.inOut',
      }, 0.3);
    };

    // 6. Climax: Currents converge -> Logo Springs Out -> Unlock Scroll
    const triggerLogoPop = () => {
      const popTl = gsap.timeline({
        onComplete: () => {
          restoreScroll(); // Unlock scroll only after preloader has fully exited
          setIsFinished(true);
          if (onComplete) onComplete();
        },
      });

      // A. Converge wave paths into center point
      popTl.to([path1, path2], {
        scaleX: 0.2,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.in',
      }, 0);

      // B. Ambient Gold Flash at center
      popTl.fromTo(
        glowFlashRef.current,
        { scale: 0.2, opacity: 0.9 },
        { scale: 3, opacity: 0, duration: 0.7, ease: 'power2.out' },
        0.2
      );

      // C. MATSYA LOGO POPS UP with spring physics
      popTl.fromTo(
        logoWrapperRef.current,
        {
          scale: 0,
          opacity: 0,
          y: 20,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'back.out(2.2)',
        },
        0.3
      );

      // D. Subtle tagline reveal
      popTl.to(
        subtextRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        },
        0.6
      );

      // E. Elegant hold, then curtain wipes upward out of view
      popTl.to(containerRef.current, {
        yPercent: -100,
        duration: 0.85,
        delay: 0.8,
        ease: 'power3.inOut',
      });
    };

    runWaveCycle();

    return () => {
      restoreScroll(); // Failsafe unlock on unmount
      window.removeEventListener('load', handleLoad);
      clearTimeout(timer);
    };
  }, [onComplete]);

  if (isFinished) return null;

  return (
    <aside
      ref={containerRef}
      aria-label="Loading Matsya Fisheries"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#17164F] select-none pointer-events-auto overflow-hidden touch-none"
    >
      {/* Subtle background ocean vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-[#221F6D]/50 via-transparent to-[#10103A] pointer-events-none" />

      {/* Main Animation Stage */}
      <div className="relative w-full max-w-[500px] h-[300px] flex items-center justify-center px-6">
        
        {/* 1. Fluid Wave Paths */}
        <div ref={waveTrackRef} className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 600 200"
            fill="none"
            className="w-full h-auto overflow-visible"
          >
            {/* Left Current Path */}
            <path
              ref={wave1Ref}
              d="M 20 100 C 140 30, 200 170, 300 100"
              stroke="#D7C37A"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(215,195,122,0.4)]"
            />

            {/* Right Current Path */}
            <path
              ref={wave2Ref}
              d="M 580 100 C 460 170, 400 30, 300 100"
              stroke="#D7C37A"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(215,195,122,0.4)]"
            />
          </svg>
        </div>

        {/* 2. Impulse Flash Light Ring */}
        <div
          ref={glowFlashRef}
          className="absolute w-24 h-24 rounded-full bg-radial-gradient from-[#D7C37A] to-transparent opacity-0 pointer-events-none"
        />

        {/* 3. Matsya Logo Container */}
        <div
          ref={logoWrapperRef}
          className="relative z-20 flex flex-col items-center justify-center opacity-0"
          style={{ willChange: 'transform, opacity' }}
        >
          <img
            src={logoSrc}
            alt="Matsya Fisheries"
            className="w-48 sm:w-56 md:w-64 h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] select-none"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/matsya-logo.png';
            }}
          />

          <span
            ref={subtextRef}
            className="text-[12px] font-semibold tracking-[0.35em] uppercase text-[#D7C37A] mt-4 opacity-0 translate-y-2 select-none"
          >
            • Mumbai •
          </span>
        </div>

      </div>
    </aside>
  );
}