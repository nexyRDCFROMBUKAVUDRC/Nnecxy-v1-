/**
 * Official NNECXY Logo Component
 * Strictly adhering to Section 7, 8, 30 and Page 8 visual specification
 * High-tech HUD cyan/blue glowing concentric circle with white central "N"
 * and solid cyan speech bubble in bottom-right corner.
 */

import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const LogoNNECXY: React.FC<LogoProps> = ({ size = 120, className = '', showText = false }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        style={{ width: size, height: size }} 
        className="relative flex items-center justify-center select-none"
      >
        <svg 
          viewBox="0 0 500 500" 
          width="100%" 
          height="100%" 
          className="w-full h-full drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]"
        >
          <defs>
            <filter id="nnecxyCyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="nnecxyCyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="40%" stopColor="#0088FF" />
              <stop offset="100%" stopColor="#0033AA" />
            </linearGradient>

            <radialGradient id="nnecxyDarkDisc" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#061A38" />
              <stop offset="65%" stopColor="#020C1C" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>
          </defs>

          {/* Deep Black Rounded Container */}
          <rect width="500" height="500" fill="#000000" rx="36" />

          {/* Outermost dotted tracking ring */}
          <circle 
            cx="250" 
            cy="250" 
            r="215" 
            fill="none" 
            stroke="#00E5FF" 
            strokeWidth="2" 
            strokeDasharray="4 10" 
            opacity="0.5" 
          />
          
          {/* Segmented HUD Ring */}
          <circle 
            cx="250" 
            cy="250" 
            r="204" 
            fill="none" 
            stroke="#00B4D8" 
            strokeWidth="3" 
            strokeDasharray="24 18 8 18" 
            opacity="0.65" 
          />

          {/* Main glowing cyan & cyber blue ring */}
          <circle 
            cx="250" 
            cy="250" 
            r="192" 
            fill="none" 
            stroke="url(#nnecxyCyberGrad)" 
            strokeWidth="6" 
            filter="url(#nnecxyCyanGlow)" 
          />
          <circle 
            cx="250" 
            cy="250" 
            r="192" 
            fill="none" 
            stroke="#FFFFFF" 
            strokeWidth="1.5" 
            opacity="0.8" 
          />

          {/* Top glowing tech arc */}
          <path 
            d="M 115 185 A 185 185 0 0 1 385 185" 
            fill="none" 
            stroke="#00E5FF" 
            strokeWidth="4" 
            strokeDasharray="16 10 32 10 8 10" 
            opacity="0.9" 
          />
          {/* Bottom tech arc */}
          <path 
            d="M 110 320 A 185 185 0 0 0 320 385" 
            fill="none" 
            stroke="#0088FF" 
            strokeWidth="4" 
            strokeDasharray="22 12 10 12" 
            opacity="0.85" 
          />

          {/* Digital tick markers at sides */}
          <path d="M 82 240 L 94 240 M 82 250 L 98 250 M 82 260 L 94 260" stroke="#00E5FF" strokeWidth="3" strokeLinecap="round" />
          <path d="M 406 240 L 418 240 M 402 250 L 418 250 M 406 260 L 418 260" stroke="#00E5FF" strokeWidth="3" strokeLinecap="round" />

          {/* Fine interior concentric rings */}
          <circle cx="250" cy="250" r="172" fill="none" stroke="#00E5FF" strokeWidth="2.5" strokeDasharray="4 6" opacity="0.8" />
          <circle cx="250" cy="250" r="158" fill="none" stroke="#00E5FF" strokeWidth="3" opacity="0.9" filter="url(#nnecxyCyanGlow)" />
          
          {/* Inner Dark Tech Disc */}
          <circle cx="250" cy="250" r="142" fill="url(#nnecxyDarkDisc)" stroke="#00E5FF" strokeWidth="2" />
          <circle cx="250" cy="250" r="128" fill="none" stroke="#0088FF" strokeWidth="1.5" strokeDasharray="16 8" opacity="0.5" />

          {/* Bold White Letter "N" */}
          <text 
            x="250" 
            y="294" 
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
            fontSize="136" 
            fontWeight="900" 
            fill="#FFFFFF" 
            textAnchor="middle"
            letterSpacing="-2"
          >
            N
          </text>

          {/* Official Solid Cyan Speech Bubble in Bottom-Right */}
          <g transform="translate(305, 305)" filter="url(#nnecxyCyanGlow)">
            <path 
              d="M 75 0 
                 C 116 0 150 33 150 74 
                 C 150 115 116 148 75 148 
                 C 62 148 50 145 39 139 
                 L 5 152 
                 L 19 119 
                 C 7 107 0 91 0 74 
                 C 0 33 34 0 75 0 Z" 
              fill="#00E5FF" 
            />
          </g>
        </svg>
      </div>
      {showText && (
        <span className="mt-3 text-2xl font-black tracking-widest text-white uppercase drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">
          NNECXY
        </span>
      )}
    </div>
  );
};
