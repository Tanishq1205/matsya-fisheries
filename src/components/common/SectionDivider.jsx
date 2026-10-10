import React, { useId } from 'react';

/**
 * Fish-scale divider.
 * A rule made of tiny overlapping scales that fades out toward both edges,
 * with a small fish at the centre. Sits on the cream page background.
 *
 * <SectionDivider />                      default spacing
 * <SectionDivider className="my-0" />     override spacing
 */
export default function SectionDivider({ className = '' }) {
  const uid = useId().replace(/:/g, '');
  const patternId = `scales-${uid}`;
  const fadeId = `fade-${uid}`;
  const maskId = `mask-${uid}`;

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`w-full flex justify-center px-6 sm:px-12 py-10 sm:py-14 select-none pointer-events-none ${className}`}
    >
      <svg
        viewBox="0 0 960 40"
        className="w-full max-w-[860px] h-10"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Overlapping-circle lattice = classic fish scales */}
          <pattern id={patternId} width="20" height="10" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="10" stroke="#1D184D" strokeOpacity="0.5" strokeWidth="1.1" />
            <circle cx="0" cy="0" r="10" stroke="#1D184D" strokeOpacity="0.5" strokeWidth="1.1" />
            <circle cx="20" cy="0" r="10" stroke="#1D184D" strokeOpacity="0.5" strokeWidth="1.1" />
          </pattern>

          {/* Fade the scales out toward both ends and around the fish */}
          <linearGradient id={fadeId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.18" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.82" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id={maskId}>
            <rect width="960" height="40" fill={`url(#${fadeId})`} />
            {/* clear space for the fish */}
            <rect x="430" y="0" width="100" height="40" fill="#000" />
          </mask>
        </defs>

        {/* scale rule */}
        <rect
          x="0"
          y="10"
          width="960"
          height="20"
          fill={`url(#${patternId})`}
          mask={`url(#${maskId})`}
        />

        {/* centre fish (navy body, gold eye) */}
        <g transform="translate(480 20)">
          <path d="M-17 0 C-9 -9 5 -9 12 0 C5 9 -9 9 -17 0 Z" fill="#1D184D" />
          <path d="M11 0 L22 -7 L19 0 L22 7 Z" fill="#1D184D" />
          <circle cx="-9" cy="-1.5" r="1.4" fill="#D5C582" />
          <path d="M-3 -5 C0 -2 0 2 -3 5" stroke="#D5C582" strokeWidth="1" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}