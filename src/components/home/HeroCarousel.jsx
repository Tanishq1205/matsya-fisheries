import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import HeroBanner from './HeroBanner';

/**
 * Hero carousel: slide 1 is your existing HeroBanner, slides 2 and 3 are the
 * Scampi and Yellowfin Tuna banners. Auto-advances, has arrows, dots, swipe
 * and keyboard support, and replays each slide's entrance animation on arrival.
 */

const AUTOPLAY_MS = 7000; // time each slide stays before sliding on
const SLIDE_MS = 900; // sideways slide duration
const SLIDE_COUNT = 3;

const RED = '#E5262A';

// Fish line-art used as a faint corner decoration (inline SVG, so no image file is needed)
const FISH_PATH =
  'M115 383 109 386 102 393 98 402 99 415 102 421 109 428 118 432 133 431 140 427 148 416 149 413 148 398 142 389 132 383 128 382ZM123 403 126 404 128 407 125 411 122 411 120 409 120 405ZM334 99 316 97 283 98 248 103 222 109 193 118 156 133 110 158 76 182 47 207 26 229 6 254 0 263 0 318 23 280 47 249 78 218 120 186 147 170 171 158 192 149 228 137 259 130 288 126 330 126 331 127ZM221 23 220 22 183 30 149 41 129 49 93 66 48 93 30 106 0 131 0 174 28 145 46 130 79 107 105 92 136 77 169 64 195 56 225 50ZM775 276 766 250 758 236 745 218 733 205 714 189 698 178 678 167 681 155 683 138 683 101 679 77 674 60 665 40 656 26 638 3 597 117 570 185 566 192 532 181 484 171 456 168 443 168 442 167 403 167 402 168 369 170 330 177 293 187 247 205 219 219 212 224 210 224 175 247 147 269 113 302 83 339 61 373 41 413 26 454 54 465 94 477 134 485 161 488 176 488 177 489 215 489 268 483 318 471 357 457 395 439 439 412 472 386 503 356 532 321 547 299 567 264 581 231 583 229 711 280 719 282 739 291 775 305 781 306ZM137 319 145 322 165 336 181 352 191 366 200 383 207 403 210 419 210 449 208 459 206 461 164 460 132 456 95 448 66 439 63 437 69 421 93 376 114 346ZM555 219 552 228 536 261 515 295 485 333 449 368 407 399 385 412 357 426 309 444 278 452 242 458 237 457 239 447 238 412 233 389 224 366 211 344 199 329 177 309 160 298 166 291 195 268 216 254 248 236 293 217 343 203 392 196 407 196 408 195 452 196 486 200 507 204 534 211ZM646 69 650 80 654 101 654 139 651 158 644 184 658 189 672 196 698 213 713 226 725 239 737 257 736 259 598 205 594 202 624 127 642 76Z';

function FishOutline({ className = '', style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 783 493" aria-hidden="true" focusable="false">
      <path fill="#EFE8CF" fillRule="evenodd" d={FISH_PATH} />
    </svg>
  );
}
const NAVY = '#1D184D';

const CSS = `
.hc-root { position: relative; width: 100%; overflow: hidden; background: #FAF7EE; font-family: 'Sora', sans-serif; }
.hc-viewport { overflow: hidden; touch-action: pan-y; }
.hc-track { display: flex; width: 100%; will-change: transform; transition: transform ${SLIDE_MS}ms cubic-bezier(.65,0,.25,1); }
.hc-slide { position: relative; flex: 0 0 100%; width: 100%; height: 100vh; min-height: 680px; overflow: hidden; background: #FAF7EE; }

/* entrance animations: hidden by default, played while the slide is active */
.hc-a { opacity: 0; }
.hc-slide.is-held .hc-a { opacity: 1; }
.hc-slide.is-active .hc-a { animation: var(--anim, hc-up) var(--dur, .8s) var(--ease, cubic-bezier(.215,.61,.355,1)) var(--delay, .45s) both; }
@keyframes hc-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
@keyframes hc-down { from { opacity: 0; transform: translateY(-40px); } to { opacity: 1; transform: none; } }
@keyframes hc-left { from { opacity: 0; transform: translateX(-130px); } to { opacity: 1; transform: none; } }
@keyframes hc-right { from { opacity: 0; transform: translateX(300px); } to { opacity: 1; transform: none; } }
@keyframes hc-rise-c { from { opacity: 0; transform: translate(-50%, 60%); } to { opacity: 1; transform: translate(-50%, 0); } }
@keyframes hc-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes hc-doodle { from { opacity: 0; transform: var(--t0, scale(.85)); } to { opacity: 1; transform: var(--t1, none); } }

/* decorative outline fish */
.hc-doodle { position: absolute; pointer-events: none; display: block; height: auto; z-index: 1; }
.hc-doodle.tr { top: 3.5%; right: -2.5vw; --t0: scaleX(-1) scale(.85); --t1: scaleX(-1); transform: scaleX(-1); width: clamp(110px, 16vw, 340px); }
.hc-doodle.bl { bottom: -1.2vw; left: -2.2vw; width: clamp(100px, 13vw, 280px); }

/* shared type */
.hc-h { margin: 0; font-weight: 800; letter-spacing: -0.015em; text-transform: uppercase; color: ${NAVY}; line-height: 1.04; }
.hc-mr { margin: 0; color: ${NAVY}; font-weight: 500; font-family: 'Sora','Noto Sans Devanagari','Hind',sans-serif; }
.hc-cta { display: inline-flex; align-items: center; gap: 8px; background: none; border: 0; padding: 6px 0; cursor: pointer; font: inherit; font-weight: 700; letter-spacing: .02em; text-transform: uppercase; transition: gap .2s, opacity .2s; }
.hc-cta:hover { gap: 14px; opacity: .85; }

/* slide 2 : Scampi */
.hc-scampi-copy { position: absolute; left: clamp(24px, 5vw, 100px); top: 50%; transform: translateY(-46%); z-index: 3; max-width: 56%; }
.hc-scampi .hc-h { font-size: clamp(2.1rem, 6.4vw, 8rem); }
.hc-scampi .hc-mr { font-size: clamp(1.1rem, 2.7vw, 3.2rem); margin-top: clamp(14px, 1.8vw, 28px); }
.hc-scampi .hc-cta { color: ${RED}; font-size: clamp(.95rem, 2vw, 2.4rem); margin-top: clamp(14px, 2.2vw, 40px); }
.hc-shrimp-wrap { --w: min(55.5vw, 104vh); position: absolute; width: var(--w); right: calc(var(--w) * -0.279); bottom: calc(var(--w) * -0.147); aspect-ratio: 832 / 759; z-index: 2; pointer-events: none; }
.hc-shrimp-wrap img { width: 100%; height: 100%; object-fit: contain; display: block; filter: drop-shadow(0 22px 28px rgba(29,24,77,.22)); }

/* slide 3 : Yellowfin tuna */
.hc-tuna .hc-top { position: absolute; left: 0; right: 0; top: clamp(96px, 15vh, 190px); text-align: center; z-index: 3; padding: 0 20px; }
.hc-tuna .hc-h { font-size: clamp(2rem, 5.4vw, 6.2rem); }
.hc-tuna .hc-sub { display: block; margin-top: clamp(10px, 1.4vw, 24px); color: ${RED}; font-weight: 800; letter-spacing: .02em; text-transform: uppercase; font-size: clamp(1rem, 2vw, 2.3rem); }
.hc-tuna-img { position: absolute; left: 50%; bottom: -52%; height: 104%; z-index: 2; pointer-events: none; transform: translate(-50%, 0); }
.hc-tuna-img img { height: 100%; width: auto; display: block; filter: drop-shadow(0 18px 24px rgba(29,24,77,.2)); }
.hc-tuna .hc-cta-wrap { position: absolute; right: clamp(20px, 5vw, 100px); bottom: clamp(28px, 6vh, 70px); z-index: 4; }
.hc-tuna .hc-cta { color: ${RED}; font-size: clamp(.9rem, 1.5vw, 1.7rem); }

/* arrows */
.hc-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 30; width: 46px; height: 46px; border-radius: 999px; display: flex; align-items: center; justify-content: center; background: ${NAVY}; color: #D5C582; border: 1px solid rgba(213,197,130,.35); box-shadow: 0 8px 22px rgba(29,24,77,.28); cursor: pointer; transition: background .2s, transform .2s, border-color .2s; }
.hc-arrow:hover { background: #15113A; border-color: #D5C582; transform: translateY(-50%) scale(1.08); }
.hc-arrow:active { transform: translateY(-50%) scale(.95); }
.hc-arrow.prev { left: clamp(10px, 2vw, 32px); }
.hc-arrow.next { right: clamp(10px, 2vw, 32px); }

/* dots with progress fill */
.hc-dots { padding: 8px 12px; border-radius: 999px; background: rgba(250,247,238,.78); backdrop-filter: blur(6px); position: absolute; left: 50%; bottom: clamp(16px, 3.2vh, 34px); transform: translateX(-50%); z-index: 30; display: flex; gap: 10px; align-items: center; }
.hc-dot { position: relative; width: 10px; height: 10px; padding: 0; border: 0; border-radius: 999px; background: rgba(29,24,77,.22); cursor: pointer; overflow: hidden; transition: width .35s, background .2s; }
.hc-dot:hover { background: rgba(29,24,77,.4); }
.hc-dot.on { width: 38px; }
.hc-dot > i { position: absolute; inset: 0; border-radius: inherit; background: ${NAVY}; transform-origin: left; transform: scaleX(0); }
.hc-dot.on > i { animation: hc-fill ${AUTOPLAY_MS}ms linear forwards; animation-play-state: var(--play, running); }
.hc-dot.on.static > i { animation: none; transform: scaleX(1); }
@keyframes hc-fill { to { transform: scaleX(1); } }

/* phones */
@media (max-width: 767px) {
  .hc-scampi-copy { top: 17%; transform: none; max-width: 90%; }
  .hc-scampi .hc-h { font-size: clamp(1.9rem, 9vw, 3rem); }
  .hc-shrimp-wrap { --w: min(118vw, 74vh); right: calc(var(--w) * -0.1); bottom: calc(var(--w) * -0.07); }
  .hc-tuna .hc-top { top: clamp(88px, 14vh, 130px); }
  .hc-tuna .hc-h { font-size: clamp(1.8rem, 8.4vw, 3rem); }
  .hc-tuna-img { height: 80%; bottom: -34%; }
  .hc-tuna .hc-cta-wrap { left: 0; right: 0; text-align: center; bottom: auto; top: 28%; }
  .hc-arrow { width: 38px; height: 38px; top: auto; bottom: 14px; transform: none; }
  .hc-arrow:hover, .hc-arrow:active { transform: none; }
  .hc-arrow.prev { left: 14px; } .hc-arrow.next { right: 14px; }
  .hc-doodle.bl { bottom: 4%; }
}

@media (prefers-reduced-motion: reduce) {
  .hc-track { transition: none; }
  .hc-a { opacity: 1 !important; animation: none !important; transform: none !important; }
  .hc-tuna-img { transform: translate(-50%, 0) !important; }
}
`;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function HeroCarousel({ isPreloaderFinished = false, onExploreCatalog }) {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(-1); // slide that just left (stays visible while it slides out)
  const [heroKey, setHeroKey] = useState(0); // remount slide 1 so its GSAP intro replays
  const [paused, setPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [reduced] = useState(prefersReducedMotion);

  const heldTimer = useRef(null);
  const touch = useRef(null);

  const goTo = useCallback(
    (next) => {
      const target = ((next % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT;
      if (target === index) return;
      setHeld(index);
      clearTimeout(heldTimer.current);
      heldTimer.current = setTimeout(() => setHeld(-1), SLIDE_MS + 100);
      if (target === 0) setHeroKey((k) => k + 1);
      setIndex(target);
    },
    [index]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => () => clearTimeout(heldTimer.current), []);

  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const handleCta = () => {
    if (onExploreCatalog) onExploreCatalog();
    else document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const onPointerDown = (e) => {
    touch.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e) => {
    const s = touch.current;
    touch.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      dx < 0 ? next() : prev();
    }
  };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  };

  const playing = isPreloaderFinished && !reduced;
  const running = playing && !paused && !tabHidden;

  const slideClass = (i) =>
    `hc-slide ${i === index ? 'is-active' : ''} ${i === held ? 'is-held' : ''}`;

  return (
    <section
      className="hc-root"
      aria-roledescription="carousel"
      aria-label="Featured catches"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKeyDown}
    >
      <style>{CSS}</style>

      <div className="hc-viewport" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        <div className="hc-track" style={{ transform: `translate3d(-${index * 100}%,0,0)` }}>
          {/* 1 — existing hero */}
          <div className={slideClass(0)} aria-hidden={index !== 0} inert={index !== 0}>
            <HeroBanner
              key={heroKey}
              isPreloaderFinished={isPreloaderFinished}
              onExploreCatalog={onExploreCatalog}
            />
          </div>

          {/* 2 — Scampi */}
          <div
            className={`${slideClass(1)} hc-scampi`}
            aria-hidden={index !== 1}
            inert={index !== 1}
          >
            <FishOutline className="hc-doodle tr hc-a" style={{'--anim': 'hc-doodle', '--delay': '.5s', '--dur': '1.2s'}} />
            <FishOutline className="hc-doodle bl hc-a" style={{'--anim': 'hc-doodle', '--delay': '.7s', '--dur': '1.2s'}} />

            <div className="hc-scampi-copy">
              <h2 className="hc-h hc-a" style={{ '--anim': 'hc-left', '--dur': '.9s', '--delay': '.45s' }}>
                The plot twist
                <br />
                of the ocean.
              </h2>
              <p className="hc-mr hc-a" style={{ '--anim': 'hc-left', '--delay': '1.1s' }}>
                समुद्रातलं काहीतरी वेगळं.
              </p>
              <div className="hc-a" style={{ '--anim': 'hc-left', '--delay': '1.22s' }}>
                <button type="button" className="hc-cta" onClick={handleCta}>
                  Meet Scampi <ArrowRight size={20} strokeWidth={3} />
                </button>
              </div>
            </div>

            <div className="hc-shrimp-wrap hc-a" style={{ '--anim': 'hc-right', '--dur': '1.05s', '--ease': 'cubic-bezier(.25,.46,.45,.94)', '--delay': '.8s' }}>
              <img src="/images/hero/scampi.png" alt="Fresh scampi in a bowl" />
            </div>
          </div>

          {/* 3 — Yellowfin tuna */}
          <div
            className={`${slideClass(2)} hc-tuna`}
            aria-hidden={index !== 2}
            inert={index !== 2}
          >
            <FishOutline className="hc-doodle tr hc-a" style={{'--anim': 'hc-doodle', '--delay': '.5s', '--dur': '1.2s'}} />
            <FishOutline className="hc-doodle bl hc-a" style={{'--anim': 'hc-doodle', '--delay': '.7s', '--dur': '1.2s'}} />

            <div className="hc-top">
              <h2 className="hc-h hc-a" style={{ '--anim': 'hc-down', '--dur': '.85s', '--delay': '.45s' }}>
                The ocean has
                <br />
                a golden side.
              </h2>
              <span className="hc-sub hc-a" style={{ '--anim': 'hc-down', '--delay': '1.2s' }}>
                Yellowfin Tuna
              </span>
            </div>

            <div
              className="hc-tuna-img hc-a"
              style={{ '--anim': 'hc-rise-c', '--dur': '1.1s', '--ease': 'cubic-bezier(.25,.46,.45,.94)', '--delay': '.8s' }}
            >
              <img src="/images/hero/tuna-vertical.png" alt="Yellowfin tuna" />
            </div>

            <div className="hc-cta-wrap hc-a" style={{ '--anim': 'hc-down', '--delay': '1.32s' }}>
              <button type="button" className="hc-cta" onClick={handleCta}>
                Discover the catch <ArrowRight size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* arrows */}
      <button type="button" className="hc-arrow prev" onClick={prev} aria-label="Previous banner">
        <ChevronLeft size={22} />
      </button>
      <button type="button" className="hc-arrow next" onClick={next} aria-label="Next banner">
        <ChevronRight size={22} />
      </button>

      {/* dots + autoplay progress; the fill finishing is what advances the slide */}
      <div className="hc-dots" style={{ '--play': running ? 'running' : 'paused' }}>
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to banner ${i + 1}`}
            aria-current={i === index}
            className={`hc-dot ${i === index ? 'on' : ''} ${i === index && !playing ? 'static' : ''}`}
            onClick={() => goTo(i)}
          >
            <i
              key={i === index ? `a${index}` : `i${i}`}
              onAnimationEnd={i === index && playing ? next : undefined}
            />
          </button>
        ))}
      </div>
    </section>
  );
}