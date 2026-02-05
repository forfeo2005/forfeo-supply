// frontend/src/components/ForfeoLogo.jsx
import React from 'react';

const ForfeoLogo = ({ className = "w-10 h-10", dark = false, withText = false, size = "md" }) => {
  // Palette 2026 chic : émeraude, or, gris anthracite
  const primaryColor = dark ? "#111827" : "#FFFFFF";
  const accentColor = dark ? "#059669" : "#10B981";
  const goldAccent = "#D4AF37";
  const lightGray = "#6B7280";
  
  // Tailles responsive
  const dimensions = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12"
  }[size];

  return (
    <div className="flex items-center gap-2">
      {/* Icône monogramme élégant FS */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className={`${dimensions} ${className} transition-all duration-300`}
      >
        <defs>
          {/* Gradient chic pour 2026 */}
          <linearGradient id="forfeo-gradient-2026" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.9" />
            <stop offset="50%" stopColor={goldAccent} stopOpacity="0.7" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.9" />
          </linearGradient>
          
          {/* Gradient pour le texte */}
          <linearGradient id="text-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="50%" stopColor={goldAccent} />
            <stop offset="100%" stopColor={accentColor} />
          </linearGradient>
        </defs>

        {/* Cercle de fond avec effet verre */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="url(#forfeo-gradient-2026)"
          opacity="0.95"
          className="transition-all duration-500"
        />
        
        {/* Effet de lumière */}
        <circle
          cx="30"
          cy="30"
          r="15"
          fill="white"
          opacity="0.1"
        />

        {/* Monogramme FS minimaliste et chic */}
        {/* Lettre F stylisée */}
        <path
          d="M35,30 L35,70 L50,70 L50,55 L42,55 L42,45 L50,45 L50,30 Z"
          fill={primaryColor}
          className="transition-all duration-300"
        />
        
        {/* Lettre S stylisée */}
        <path
          d="M55,30 C65,30 70,40 70,50 C70,60 65,70 55,70 C45,70 40,60 40,50 C40,40 45,30 55,30 Z"
          fill="none"
          stroke={primaryColor}
          strokeWidth="5"
          strokeLinecap="round"
          className="transition-all duration-300"
        />
        <path
          d="M55,35 C62,35 65,40 65,50 C65,60 62,65 55,65 C48,65 45,60 45,50 C45,40 48,35 55,35 Z"
          fill="none"
          stroke={goldAccent}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Point central élégant */}
        <circle
          cx="50"
          cy="50"
          r="3"
          fill={goldAccent}
          className="animate-pulse"
        >
          <animate
            attributeName="r"
            values="3;5;3"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Bordure subtile */}
        <circle
          cx="50"
          cy="50"
          r="43"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.5"
        />
      </svg>

      {/* Texte FORFEO SUPPLY - Version responsive */}
      {withText && (
        <div className={`flex flex-col leading-tight ${size === "sm" ? "scale-90" : ""}`}>
          <span className={`font-bold tracking-tight ${dark ? 'text-gray-900' : 'text-white'} ${
            size === "sm" ? "text-sm" : 
            size === "md" ? "text-lg" : 
            size === "lg" ? "text-xl" : "text-2xl"
          }`}>
            FORFEO
          </span>
          <span className={`font-light tracking-wider ${dark ? 'text-gray-600' : 'text-gray-300'} ${
            size === "sm" ? "text-xs" : 
            size === "md" ? "text-xs" : 
            size === "lg" ? "text-sm" : "text-base"
          }`}>
            SUPPLY
          </span>
        </div>
      )}
    </div>
  );
};

export default ForfeoLogo;
