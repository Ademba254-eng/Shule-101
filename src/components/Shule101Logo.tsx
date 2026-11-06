import React from 'react';

export interface Shule101LogoProps {
  variant?: 'full' | 'mark' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  lightText?: boolean;
  showTagline?: boolean;
}

export const Shule101Logo: React.FC<Shule101LogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  lightText = false,
  showTagline = true,
}) => {
  // Dimension mapping
  const sizeMap = {
    sm: {
      mark: 'w-7 h-7',
      full: 'h-8',
      textShule: 'text-sm',
      textNumber: 'text-sm',
      tagline: 'text-[9px]',
    },
    md: {
      mark: 'w-9 h-9',
      full: 'h-10',
      textShule: 'text-base sm:text-lg',
      textNumber: 'text-base sm:text-lg',
      tagline: 'text-[10px]',
    },
    lg: {
      mark: 'w-12 h-12',
      full: 'h-14',
      textShule: 'text-xl sm:text-2xl',
      textNumber: 'text-xl sm:text-2xl',
      tagline: 'text-xs',
    },
    xl: {
      mark: 'w-16 h-16',
      full: 'h-20',
      textShule: 'text-3xl',
      textNumber: 'text-3xl',
      tagline: 'text-sm',
    },
    '2xl': {
      mark: 'w-24 h-24',
      full: 'h-28',
      textShule: 'text-4xl',
      textNumber: 'text-4xl',
      tagline: 'text-base',
    },
  }[size];

  // SVG Mark (Mortarboard + Golden Hexagon House + 4 Window Panes)
  const LogoMark = (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeMap.mark} flex-shrink-0`}
      aria-label="Shule 101 Logo Icon"
    >
      {/* Golden Hexagonal House Outline */}
      {/* Top Left rafter */}
      <path
        d="M26 38L44 26"
        stroke="#EAA023"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Top Right rafter */}
      <path
        d="M74 38L56 26"
        stroke="#EAA023"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Left Wall & Lower Angle with rounded ends */}
      <path
        d="M23 37L15 45V69L37 84"
        stroke="#EAA023"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right Wall with rounded end */}
      <path
        d="M77 37L85 45V58"
        stroke="#EAA023"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Graduation Mortarboard Cap */}
      {/* Cap Skull Base */}
      <path
        d="M37 25C37 25 43 31 50 31C57 31 63 25 63 25V28C63 32.5 57 35 50 35C43 35 37 32.5 37 28V25Z"
        fill="#261611"
      />
      {/* Cap Diamond Top */}
      <polygon
        points="50,11 81,21 50,29 19,21"
        fill="#261611"
      />
      {/* Tassel Button & String */}
      <circle cx="50" cy="20" r="1.5" fill="#EAA023" />
      <path
        d="M49 20L31 23V29"
        stroke="#261611"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Tassel brush */}
      <rect x="29.5" y="29" width="3" height="4.5" rx="1" fill="#261611" />

      {/* 4 Square Window Panes in 2x2 Grid */}
      <rect x="40" y="44" width="8" height="8" rx="1.5" fill="#261611" />
      <rect x="52" y="44" width="8" height="8" rx="1.5" fill="#261611" />
      <rect x="40" y="56" width="8" height="8" rx="1.5" fill="#261611" />
      <rect x="52" y="56" width="8" height="8" rx="1.5" fill="#261611" />
    </svg>
  );

  if (variant === 'mark') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{LogoMark}</div>;
  }

  // Full stacked or horizontal brand
  const textColor = lightText ? 'text-white' : 'text-[#261611]';
  const taglineColor = lightText ? 'text-amber-200/90' : 'text-[#3E2519]';

  return (
    <div className={`inline-flex items-center space-x-3 select-none ${className}`}>
      {LogoMark}

      <div className="flex flex-col justify-center">
        <div className="leading-[0.92] tracking-tight">
          <span
            className={`font-black uppercase block ${sizeMap.textShule} ${textColor}`}
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            SHULE
          </span>
          <span
            className={`font-black uppercase block ${sizeMap.textNumber} ${textColor}`}
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            101
          </span>
        </div>

        {showTagline && (
          <p
            className={`font-medium tracking-normal mt-0.5 whitespace-nowrap ${sizeMap.tagline} ${taglineColor}`}
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            connect . simplify and grow
          </p>
        )}
      </div>
    </div>
  );
};

// Aliases for backwards compatibility
export const ShuleCentralLogo = Shule101Logo;
export type ShuleCentralLogoProps = Shule101LogoProps;
