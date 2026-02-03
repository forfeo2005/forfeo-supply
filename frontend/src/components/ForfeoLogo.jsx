import React from 'react';

const ForfeoLogo = ({ className = "w-10 h-10", dark = false }) => {
  // Choisit la couleur selon si on est sur fond clair (dark=false) ou foncé (dark=true)
  const colorClass = dark ? "text-slate-900" : "text-white";
  const accentClass = "text-emerald-500";

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className={className}>
      <rect width="256" height="256" fill="none"/>
      {/* La forme du F stylisé */}
      <path d="M136,80v43.47l36.24,20.71a8,8,0,0,1,4,6.93V200a8,8,0,0,1-12,6.93l-36.24-20.71A8,8,0,0,0,124,186.21V142.74l-36.24-20.71a8,8,0,0,1-4-6.93V64a8,8,0,0,1,12-6.93l36.24,20.71A8,8,0,0,0,136,80Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" className={colorClass}/>
      {/* La feuille (accent) */}
      <path d="M176,64c0,26.51-21.49,48-48,48s-48-21.49-48-48A48,48,0,0,1,176,64Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" className={accentClass}/>
      {/* Petit détail de connexion */}
      <line x1="136" y1="123.47" x2="136" y2="80" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" className={colorClass}/>
    </svg>
  );
};

export default ForfeoLogo;
