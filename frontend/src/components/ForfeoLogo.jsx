import React from 'react';

const ForfeoLogo = ({ className = "w-10 h-10", dark = false }) => {
  // Couleurs selon fond clair / foncé
  const colorClass = dark ? "text-slate-900" : "text-white";
  const accentClass = dark ? "text-emerald-400" : "text-emerald-300";

  return (
    <div className="flex items-center">
      {/* Icône animée seulement (sans texte FORFEO SUPPLY) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        className={`${className} animate-pulse-slow`}
      >
        <defs>
          {/* Gradients animés */}
          <linearGradient id="forfeo-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.9">
              <animate
                attributeName="stop-color"
                values="#10b981;#059669;#10b981"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#059669" stopOpacity="0.9">
              <animate
                attributeName="stop-color"
                values="#059669;#10b981;#059669"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>

          <linearGradient id="forfeo-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7">
              <animate
                attributeName="stop-color"
                values="#3b82f6;#2563eb;#3b82f6"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.7">
              <animate
                attributeName="stop-color"
                values="#2563eb;#3b82f6;#2563eb"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>

          {/* Légère lueur */}
          <filter id="forfeo-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Cercle externe animé */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="url(#forfeo-gradient-1)"
          strokeWidth="4"
          className="animate-spin-slow"
        />

        {/* Cercle interne avec pulsation */}
        <circle
          cx="100"
          cy="100"
          r="65"
          fill="none"
          stroke="url(#forfeo-gradient-2)"
          strokeWidth="3"
          className="animate-ping-slow"
        />

        {/* Lettre F stylisée */}
        <path
          d="M70,70 L70,130 L110,130 L110,100 L90,100 L90,85 L110,85 L110,70 Z"
          fill="currentColor"
          className={colorClass}
          filter="url(#forfeo-glow)"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 100 100"
            to="360 100 100"
            dur="20s"
            repeatCount="indefinite"
          />
        </path>

        {/* Éclairs décoratifs */}
        <path
          d="M40,40 L55,55 M160,40 L145,55 M40,160 L55,145 M160,160 L145,145"
          stroke="currentColor"
          strokeWidth="2"
          className={accentClass}
          strokeLinecap="round"
        >
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>

        {/* Point central lumineux */}
        <circle
          cx="100"
          cy="100"
          r="8"
          fill="currentColor"
          className={accentClass}
        >
          <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
};

export default ForfeoLogo;
