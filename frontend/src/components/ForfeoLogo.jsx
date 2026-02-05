// frontend/src/components/ForfeoLogo.jsx
import React from 'react';

const ForfeoLogo = ({ className = "w-10 h-10", dark = false, withText = false }) => {
  // Palette 2026 chic : gris anthracite, émeraude et doré
  const primaryColor = dark ? "#111827" : "#FFFFFF";
  const accentColor = dark ? "#059669" : "#10B981";
  const goldAccent = "#D4AF37";
  const lightAccent = "#60A5FA";

  return (
    <div className="flex items-center gap-2">
      {/* Icône monogramme élégant */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        className={`${className} transition-all duration-300`}
      >
        <defs>
          {/* Gradient chic pour 2026 */}
          <linearGradient id="forfeo-gradient-2026" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.9" />
            <stop offset="50%" stopColor={goldAccent} stopOpacity="0.8" />
            <stop offset="100%" stopColor={lightAccent} stopOpacity="0.9" />
          </linearGradient>

          {/* Effet brillance subtile */}
          <filter id="forfeo-glow-2026">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Masque pour le monogramme FS */}
          <clipPath id="forfeo-clip">
            <path d="M50,50 L150,50 L150,150 L50,150 Z" />
          </clipPath>
        </defs>

        {/* Cercle de fond avec gradient */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="url(#forfeo-gradient-2026)"
          opacity="0.9"
          className="transition-all duration-500 hover:opacity-100"
        />

        {/* Monogramme FS stylisé */}
        <g clipPath="url(#forfeo-clip)" filter="url(#forfeo-glow-2026)">
          {/* Lettre F - Design moderne */}
          <path
            d="M65,60 L65,140 L95,140 L95,100 L80,100 L80,80 L95,80 L95,60 Z"
            fill={primaryColor}
            className="transition-all duration-300"
          />
          
          {/* Lettre S - Design fluide */}
          <path
            d="M110,60 C130,60 140,75 140,100 C140,125 130,140 110,140 C90,140 80,125 80,100 C80,75 90,60 110,60 Z"
            fill="none"
            stroke={primaryColor}
            strokeWidth="8"
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          <path
            d="M110,65 C125,65 135,75 135,100 C135,125 125,135 110,135 C95,135 85,125 85,100 C85,75 95,65 110,65 Z"
            fill="none"
            stroke={goldAccent}
            strokeWidth="4"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Éléments décoratifs modernes */}
          <circle
            cx="100"
            cy="100"
            r="8"
            fill={goldAccent}
            className="animate-pulse"
          >
            <animate
              attributeName="r"
              values="8;12;8"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Lignes géométriques élégantes */}
          <line
            x1="45"
            y1="100"
            x2="65"
            y2="100"
            stroke={accentColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="135"
            y1="100"
            x2="155"
            y2="100"
            stroke={accentColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="100"
            y1="45"
            x2="100"
            y2="65"
            stroke={goldAccent}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="100"
            y1="135"
            x2="100"
            y2="155"
            stroke={goldAccent}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        {/* Bordure subtile */}
        <circle
          cx="100"
          cy="100"
          r="88"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
          className="transition-all duration-300"
        />
      </svg>

      {/* Texte FORFEO SUPPLY - Optionnel */}
      {withText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-bold text-lg tracking-wider ${dark ? 'text-gray-900' : 'text-white'}`}>
            FORFEO
          </span>
          <span className={`font-light text-xs tracking-widest ${dark ? 'text-gray-600' : 'text-gray-300'}`}>
            SUPPLY
          </span>
        </div>
      )}
    </div>
  );
};

export default ForfeoLogo;
