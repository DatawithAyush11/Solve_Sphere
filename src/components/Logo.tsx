import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

const sizes = {
  sm: { icon: 28, fontSize: 16 },
  md: { icon: 36, fontSize: 20 },
  lg: { icon: 48, fontSize: 26 },
  xl: { icon: 72, fontSize: 36 },
};

export function Logo({ variant = 'full', size = 'md', className = '', animated = false }: LogoProps) {
  const { icon: iconSize, fontSize } = sizes[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${animated ? 'logo-float' : ''} ${className}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animated ? 'logo-icon-glow' : ''}
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="sphereGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(175, 80%, 55%)" />
            <stop offset="100%" stopColor="hsl(200, 80%, 45%)" />
          </linearGradient>
          <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(175, 80%, 70%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(200, 80%, 50%)" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="innerGlow" cx="40%" cy="35%">
            <stop offset="0%" stopColor="white" stopOpacity="0.25" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sphere base */}
        <circle cx="24" cy="24" r="20" fill="url(#sphereGrad)" opacity="0.15" />
        <circle cx="24" cy="24" r="16" fill="url(#sphereGrad)" opacity="0.9" />
        <circle cx="24" cy="24" r="16" fill="url(#innerGlow)" />

        {/* Orbital ring */}
        <ellipse cx="24" cy="24" rx="16" ry="6" stroke="hsl(175, 80%, 75%)" strokeWidth="1.2" fill="none" opacity="0.6" />

        {/* Neural network nodes */}
        <g filter="url(#softGlow)">
          {/* Center node */}
          <circle cx="24" cy="24" r="3" fill="white" opacity="0.95" />

          {/* Surrounding nodes */}
          <circle cx="17" cy="19" r="2" fill="white" opacity="0.85" />
          <circle cx="31" cy="19" r="2" fill="white" opacity="0.85" />
          <circle cx="17" cy="29" r="2" fill="white" opacity="0.85" />
          <circle cx="31" cy="29" r="2" fill="white" opacity="0.85" />

          {/* Connections */}
          <line x1="24" y1="24" x2="17" y2="19" stroke="white" strokeWidth="1" opacity="0.6" />
          <line x1="24" y1="24" x2="31" y2="19" stroke="white" strokeWidth="1" opacity="0.6" />
          <line x1="24" y1="24" x2="17" y2="29" stroke="white" strokeWidth="1" opacity="0.6" />
          <line x1="24" y1="24" x2="31" y2="29" stroke="white" strokeWidth="1" opacity="0.6" />
          <line x1="17" y1="19" x2="31" y2="19" stroke="white" strokeWidth="0.7" opacity="0.35" />
          <line x1="17" y1="29" x2="31" y2="29" stroke="white" strokeWidth="0.7" opacity="0.35" />
          <line x1="17" y1="19" x2="17" y2="29" stroke="white" strokeWidth="0.7" opacity="0.35" />
          <line x1="31" y1="19" x2="31" y2="29" stroke="white" strokeWidth="0.7" opacity="0.35" />
        </g>

        {/* Top glow arc */}
        <path d="M 12 20 Q 24 8 36 20" stroke="url(#glowGrad)" strokeWidth="1.5" fill="none" opacity="0.5" />
      </svg>

      {variant === 'full' && (
        <span
          style={{ fontSize, fontFamily: "'Poppins', 'Inter', system-ui, sans-serif", lineHeight: 1 }}
          className="font-bold tracking-tight"
        >
          <span className="text-gradient">Solve</span>
          <span className="text-foreground">Sphere</span>
        </span>
      )}
    </div>
  );
}

export default Logo;
