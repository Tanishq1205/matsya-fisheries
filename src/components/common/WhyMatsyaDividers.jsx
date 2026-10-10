import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Anchor } from 'lucide-react';

/**
 * Three alternative sand -> navy dividers for the top of <WhyMatsya />.
 * Use ONE of them in place of the current gradient div:
 *
 *   <ScaleEdgeDivider />      crisp fish-scale shoreline (top of a navy section)
 *   <ScaleEdgeBottomDivider /> the same, flipped (bottom of a navy section)
 *   <HorizonAnchorDivider />  smooth fade + gold horizon, ripples and anchor badge
 *   <NetMeshDivider />        smooth fade with a fishing net glowing out of the navy
 */

// Sand #FAF7EE -> Navy #1D184D, 13 opaque stops mixed in OKLab with smootherstep easing
const HORIZON_GRADIENT =
  'linear-gradient(to bottom, #FAF7EE 0%, #F9F6ED 8%, #F1EEE8 17%, #E0DEDD 25%, #C5C4CC 33%, #A4A4B6 42%, #80829D 50%, #5F6084 58%, #43436E 67%, #2F2E5E 75%, #232053 83%, #1E194E 92%, #1D184D 100%)';

/* ------------------------------------------------------------------ */
/* 1. Scale edge: the navy section starts with a scalloped fish-scale  */
/*    edge. Each lower row of scales gets darker until it melts into   */
/*    the solid navy. Echoes the scale rule used elsewhere on the site.*/
/* ------------------------------------------------------------------ */
const SCALE_R = 20; // scale radius (px)
const SCALE_STEP_Y = 14; // vertical overlap between rows
const ROW_FILLS = ['#3B3580', '#312B70', '#282360', '#221E56', '#1D184D'];
const ROW_STROKES = [0.6, 0.42, 0.28, 0.16, 0.08];

/* Drop-in animation: every scale falls from above at a random moment and
   settles into place. Starts once, when the divider scrolls into view. */
const SCALE_CSS = `
@keyframes matsya-scale-drop {
  0%   { transform: translateY(var(--drop)); opacity: 0; }
  30%  { opacity: 1; }
  100% { transform: translateY(0); opacity: 1; }
}
.matsya-scale { opacity: 0; }
.matsya-scale-body { opacity: 0; transition: opacity 700ms ease 650ms; }
.matsya-scales-play .matsya-scale {
  animation: matsya-scale-drop var(--dur) cubic-bezier(0.3, 1.12, 0.5, 1) var(--delay) both;
}
.matsya-scales-play .matsya-scale-body { opacity: 1; }
@media (prefers-reduced-motion: reduce) {
  .matsya-scale, .matsya-scale-body { opacity: 1 !important; animation: none !important; transition: none !important; }
}
`;

// Stable pseudo-random number from an integer seed (same input -> same output)
function rand01(seed) {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// Measures the divider width and reports when it first scrolls into view
function useDivider() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const [played, setPlayed] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setWidth(el.offsetWidth);
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || played) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setPlayed(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlayed(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [played]);

  return { ref, width, played };
}

// The shared scale artwork: scallops along the top edge, melting into solid navy below.
// dropSign: -1 = scales fall from above the box, +1 = for the flipped (rotated) divider.
function ScaleField({ width, played, seed, dropSign }) {
  const uid = useId().replace(/:/g, '');
  const bodyId = `scale-body-${uid}`;
  const step = SCALE_R * 2;

  const scales = useMemo(() => {
    if (!width) return [];
    const cols = Math.ceil(width / step) + 2;
    const list = [];
    for (let row = 0; row < ROW_FILLS.length; row += 1) {
      for (let col = -1; col < cols; col += 1) {
        const k = seed * 100003 + row * 7919 + (col + 1) * 104729;
        list.push({
          key: `${row}:${col}`,
          row,
          cx: col * step + (row % 2 ? SCALE_R : 0),
          cy: SCALE_R + row * SCALE_STEP_Y,
          delay: Math.round(rand01(k) * 500),
          dur: Math.round(650 + rand01(k + 1) * 350),
          drop: Math.round(90 + rand01(k + 2) * 130),
        });
      }
    }
    return list;
  }, [width, seed, step]);

  return (
    <svg
      className={`absolute inset-0 ${played ? 'matsya-scales-play' : ''}`}
      width="100%"
      height="132"
      fill="none"
    >
      <style>{SCALE_CSS}</style>
      <defs>
        <linearGradient id={bodyId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0.05" stopColor="#3B3580" />
          <stop offset="0.42" stopColor="#1D184D" />
        </linearGradient>
      </defs>

      {/* fills the cusps between the first row of scales (fades in as scales land) */}
      <rect
        className="matsya-scale-body"
        x="0"
        y={SCALE_R}
        width="100%"
        height={132 - SCALE_R}
        fill={`url(#${bodyId})`}
      />

      {scales.map((sc) => (
        <circle
          key={sc.key}
          className="matsya-scale"
          cx={sc.cx}
          cy={sc.cy}
          r={SCALE_R}
          fill={ROW_FILLS[sc.row]}
          stroke="#D5C582"
          strokeOpacity={ROW_STROKES[sc.row]}
          strokeWidth="1.2"
          style={{
            '--delay': `${sc.delay}ms`,
            '--dur': `${sc.dur}ms`,
            '--drop': `${dropSign * sc.drop}px`,
          }}
        />
      ))}

      {/* solid navy under the last row (static) */}
      <rect x="0" y={SCALE_R + 4 * SCALE_STEP_Y + SCALE_R - 1} width="100%" height="40" fill="#1D184D" />
    </svg>
  );
}

/** Sand above, navy below: the scalloped edge sits at the TOP of a navy section. */
export function ScaleEdgeDivider() {
  const { ref, width, played } = useDivider();
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative w-full h-[120px] sm:h-[132px] overflow-hidden pointer-events-none select-none bg-[#FAF7EE]"
    >
      <ScaleField width={width} played={played} seed={7} dropSign={-1} />
    </div>
  );
}

/**
 * Navy above, sand below: the same scales, flipped, hang from the BOTTOM of a
 * navy section. Optional children (e.g. the Mumbai Heritage pill) sit centred
 * on the seam and appear once the scales have landed.
 */
export function ScaleEdgeBottomDivider({ children }) {
  const { ref, width, played } = useDivider();
  return (
    <div ref={ref} className="relative w-full h-[120px] sm:h-[132px] select-none bg-[#FAF7EE]">
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none rotate-180"
      >
        <ScaleField width={width} played={played} seed={19} dropSign={1} />
      </div>
      {children && (
        <div
          className="absolute left-1/2 bottom-0 z-10 -translate-x-1/2 translate-y-1/2"
          style={{
            opacity: played ? 1 : 0,
            transform: played ? 'translate(-50%, 50%)' : 'translate(-50%, 90%)',
            transition: 'opacity 600ms ease 1500ms, transform 700ms cubic-bezier(0.2, 0.9, 0.3, 1) 1500ms',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Horizon + anchor: smooth fade, a gold horizon line that fades   */
/*    out at both ends, soft ripples, and an anchor badge (same cream */
/*    badge style as your "Mumbai Heritage" divider).                  */
/* ------------------------------------------------------------------ */
export function HorizonAnchorDivider() {
  return (
    <div
      aria-hidden="true"
      className="relative w-full h-36 sm:h-44 pointer-events-none select-none"
      style={{ background: HORIZON_GRADIENT }}
    >
      {/* horizon line */}
      <div
        className="absolute left-1/2 top-[56%] h-px w-[min(900px,88%)] -translate-x-1/2"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(213,197,130,0.85) 25%, rgba(213,197,130,0.85) 75%, transparent)',
        }}
      />

      {/* ripples under the badge */}
      <svg
        className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2"
        width="360"
        height="64"
        viewBox="0 0 360 64"
        fill="none"
      >
        <ellipse cx="180" cy="32" rx="70" ry="13" stroke="#D5C582" strokeOpacity="0.4" />
        <ellipse cx="180" cy="32" rx="120" ry="22" stroke="#D5C582" strokeOpacity="0.24" />
        <ellipse cx="180" cy="32" rx="175" ry="30" stroke="#D5C582" strokeOpacity="0.12" />
      </svg>

      {/* anchor badge */}
      <div className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#FAF7EE] border-2 border-[#1D184D] shadow-[0_8px_20px_rgba(0,0,0,0.25)] flex items-center justify-center text-[#C2542D]">
        <Anchor className="w-[18px] h-[18px]" strokeWidth={2.2} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Net mesh: smooth fade with a fine fishing-net lattice that      */
/*    appears out of the navy and fades away again.                    */
/* ------------------------------------------------------------------ */
const NET_MASK = 'linear-gradient(to bottom, transparent 12%, #000 55%, transparent 100%)';

export function NetMeshDivider() {
  return (
    <div
      aria-hidden="true"
      className="relative w-full h-36 sm:h-44 pointer-events-none select-none"
      style={{ background: HORIZON_GRADIENT }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ WebkitMaskImage: NET_MASK, maskImage: NET_MASK }}
      >
        <defs>
          <pattern id="net-mesh" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M0 18 L18 0 L36 18 L18 36 Z" fill="none" stroke="#D5C582" strokeOpacity="0.38" strokeWidth="1" />
            <circle cx="0" cy="18" r="1.5" fill="#D5C582" fillOpacity="0.7" />
            <circle cx="36" cy="18" r="1.5" fill="#D5C582" fillOpacity="0.7" />
            <circle cx="18" cy="0" r="1.5" fill="#D5C582" fillOpacity="0.7" />
            <circle cx="18" cy="36" r="1.5" fill="#D5C582" fillOpacity="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#net-mesh)" />
      </svg>
    </div>
  );
}