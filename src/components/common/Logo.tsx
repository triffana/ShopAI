import React, { useState } from 'react';
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
  const [imgFailed, setImgFailed] = useState(false);

  const dimensionMap = {
    sm: 32, // 32px x 32px
    md: 40, // 40px x 40px
    lg: 56, // 56px x 56px
  };

  const px = dimensionMap[size];

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
      {/* Perfect Circular Logo Container with explicit 50% border-radius */}
      <div
        style={{
          width: `${px}px`,
          height: `${px}px`,
          minWidth: `${px}px`,
          minHeight: `${px}px`,
          borderRadius: '50%',
          overflow: 'hidden',
          aspectRatio: '1 / 1',
        }}
        className="shrink-0 aspect-square rounded-full overflow-hidden shadow-xs transition-transform duration-300 group-hover:scale-105 bg-[#12372A] border-2 border-[#B7F34A]/40 flex items-center justify-center p-0.5 select-none"
      >
        {!imgFailed ? (
          <img
            src="/logo.svg"
            alt="ShopAI Logo"
            onError={() => setImgFailed(true)}
            style={{
              borderRadius: '50%',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            className="w-full h-full object-cover rounded-full aspect-square"
          />
        ) : (
          <div
            style={{ borderRadius: '50%' }}
            className="w-full h-full bg-gradient-to-br from-[#12372A] to-[#1F6F50] rounded-full flex items-center justify-center text-[#B7F34A]"
          >
            <svg
              className="w-3/5 h-3/5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
        )}
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
      <Link to="/" className="group inline-flex items-center select-none">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};



