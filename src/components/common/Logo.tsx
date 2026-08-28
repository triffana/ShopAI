import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showText?: boolean;
  link?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'light',
  showText = true,
  link = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const svgSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const logoContent = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Modern AI Shopping Badge */}
      <div
        className={`${iconSizes[size]} rounded-xl flex items-center justify-center shadow-xs shrink-0 transition-transform group-hover:scale-105 ${
          variant === 'dark'
            ? 'bg-[#1F6F50] text-[#B7F34A] border border-[#B7F34A]/30'
            : 'bg-[#12372A] text-[#B7F34A]'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={svgSizes[size]}
        >
          {/* Shopping bag base */}
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
          {/* AI Sparkle Node Center */}
          <circle cx="12" cy="14" r="1.5" fill="#B7F34A" stroke="none" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-extrabold ${textSizes[size]} tracking-tight leading-none ${
              variant === 'dark' ? 'text-white' : 'text-[#12372A]'
            }`}
          >
            Shop<span className="text-[#1F6F50] font-black ml-0.5">AI</span>
          </span>
          <span
            className={`text-[9px] uppercase tracking-widest font-bold ${
              variant === 'dark' ? 'text-[#B7F34A]' : 'text-[#66736A]'
            }`}
          >
            Smart Commerce
          </span>
        </div>
      )}
    </div>
  );

  if (link) {
    return (
      <Link to="/" className="group inline-flex items-center">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};
