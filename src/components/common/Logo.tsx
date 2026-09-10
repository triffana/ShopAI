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
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  const tagSizes = {
    sm: 'text-[8px]',
    md: 'text-[9px]',
    lg: 'text-[11px]',
  };

  const logoContent = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Emblem Image */}
      <div
        className={`${iconSizes[size]} rounded-xl overflow-hidden shadow-xs shrink-0 transition-transform group-hover:scale-105 bg-[#FDFBF7] p-0.5 border border-[#12372A]/15 flex items-center justify-center`}
      >
        <img
          src="/logo.png"
          alt="ShopAI Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-extrabold ${textSizes[size]} tracking-tight leading-none ${
              variant === 'dark' ? 'text-white' : 'text-[#12372A]'
            }`}
          >
            SHOP<span className="text-[#1F6F50] font-black ml-0.5">AI</span>
          </span>
          <span
            className={`uppercase tracking-widest font-bold ${tagSizes[size]} mt-0.5 ${
              variant === 'dark' ? 'text-[#B7F34A]' : 'text-[#66736A]'
            }`}
          >
            Smart Shopping, Powered by AI
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
