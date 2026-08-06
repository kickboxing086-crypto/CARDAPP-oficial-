import React, { useState } from 'react';

export function FoodTrayIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Cloche Top Knob */}
      <circle cx="12" cy="5" r="1.2" fill="currentColor" />
      {/* Cloche Dome */}
      <path d="M4 14a8 8 0 0 1 16 0" />
      {/* Shine on Dome */}
      <path d="M9 10a4 4 0 0 1 4-2" strokeWidth="1.5" opacity="0.7" />
      {/* Tray Base Plate */}
      <path d="M2 17h20" strokeWidth="2.5" />
      {/* Tray Bottom Lip */}
      <path d="M1 19.5h22" strokeWidth="1.2" opacity="0.6" />
    </svg>
  );
}

interface CardappLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  textColor?: string;
  accentColorClass?: string;
  useImage?: boolean;
}

export default function CardappLogo({ 
  className = "", 
  size = "md",
  textColor = "text-white",
  accentColorClass = "text-amber-500",
  useImage = false
}: CardappLogoProps) {
  const [imgError, setImgError] = useState(false);

  const textSizeClass = {
    sm: "text-lg",
    md: "text-2xl md:text-3xl",
    lg: "text-3xl md:text-4xl",
    xl: "text-4xl md:text-5xl"
  }[size];

  const iconContainerSize = {
    sm: "w-7 h-7 rounded-lg",
    md: "w-9 h-9 rounded-xl",
    lg: "w-11 h-11 rounded-2xl",
    xl: "w-14 h-14 rounded-2xl"
  }[size];

  const iconSizeClass = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  }[size];

  return (
    <div className={`flex items-center gap-2.5 cursor-pointer select-none group ${className}`}>
      {/* Tray Logo Icon Badge or Image */}
      <div className={`${iconContainerSize} bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10 group-hover:scale-105 group-hover:border-amber-400 transition-all overflow-hidden relative`}>
        {useImage && !imgError ? (
          <img 
            src="/app-logo.png" 
            alt="Cardapp Logo" 
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <FoodTrayIcon className={`${iconSizeClass} ${accentColorClass}`} />
        )}
      </div>

      {/* Brand Text */}
      <span className={`${textSizeClass} font-black tracking-tighter ${textColor} leading-none`}>
        Card<span className={accentColorClass}>app</span>
      </span>
    </div>
  );
}
