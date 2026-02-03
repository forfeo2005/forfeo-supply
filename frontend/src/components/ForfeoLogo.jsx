import React from "react";

const ForfeoLogo = ({
  className = "",
  dark = false,
  compact = false, // optionnel: masque le texte si besoin
}) => {
  // Couleurs selon fond
  const colorClass = dark ? "text-slate-900" : "text-white";
  const accentClass = dark ? "text-emerald-400" : "text-emerald-300";
  const subTextClass = dark ? "text-slate-700" : "text-slate-300";

  return (
    <div
      className={[
        "flex items-center gap-2",
        "select-none",
        className,
      ].join(" ")}
    >
      {/* LOGO */}
      <div className="relative">
        {/* Halo externe (glow + ping très léger) */}
        <div
          className={[
            "absolute -inset-1 rounded-full",
            "opacity-70 blur-md",
            "animate-pulse-slow",
            dark ? "bg-emerald-400/20" : "bg-emerald-300/20",
          ].join(" ")}
        />

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          className={[
            "relative",
            "w-12 h-12",
            "transition-transform duration-300",
            "hover:scale-105",
          ].join(" ")}
        >
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.85">
                <animate
                  attributeName="stop-color"
                  values="#10b981;#34d399;#059669;#10b981"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#059669" stopOpacity="0.85">
                <animate
                  attributeName="stop-color"
                  values="#059669;#10b981;#34d399;#059669"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>

            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.65">
                <animate
                  attributeName="stop-color"
                  values="#3b82f6;#60a5fa;#2563eb;#3b82f6"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.65">
                <animate
                  attributeName="stop-color"
                  values="#2563eb;#3b82f6;#60a5fa;#2563eb"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>

            {/* Glow SVG */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Cercle externe: rotation lente */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="4"
            className="animate-spin-slow"
          />

          {/* Cercle interne: ping slow */}
          <circle
            cx="100"
            cy="100"
            r="65"
            fill="none"
            stroke="url(#gradient2)"
            strokeWidth="3"
            className="animate-ping-slow"
          />

          {/* Lettre F: glow + rotation très lente */}
          <path
            d="M70,70 L70,130 L110,130 L110,100 L90,100 L90,85 L110,85 L110,70 Z"
            fill="currentColor"
            className={[colorClass, "animate-glow"].join(" ")}
            filter="url(#glow)"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 100 100"
              to="360 100 100"
              dur="28s"
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
            <animate attributeName="opacity" values="0.25;1;0.25" dur="1.1s" repeatCount="indefinite" />
          </path>

          {/* Point central */}
          <circle cx="100" cy="100" r="8" fill="currentColor" className={accentClass}>
            <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      {/* TEXTE */}
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className={["font-extrabold text-xl tracking-wider", colorClass].join(" ")}>
            <span className="inline-block animate-pulse-slow">FORFEO</span>
          </span>

          <span className={["font-semibold text-sm tracking-[0.35em]", subTextClass, "animate-bounce-slow"].join(" ")}>
            SUPPLY
          </span>
        </div>
      )}
    </div>
  );
};

export default ForfeoLogo;
