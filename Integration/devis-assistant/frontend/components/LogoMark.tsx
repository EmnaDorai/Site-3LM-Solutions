// LogoMark.tsx — logo 3LM Solutions (badge gear + croissance)
interface LogoMarkProps {
  size?: number;
  className?: string;
}

const GEAR_TEETH = [0, 45, 90, 135, 180, 225, 270, 315];

export default function LogoMark({ size = 40, className = '' }: LogoMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lm-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E3A8A" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>

      <circle cx="32" cy="32" r="32" fill="url(#lm-bg)" />
      <circle cx="32" cy="32" r="24" fill="none" stroke="#FFFFFF" strokeWidth="2" />

      {/* engrenage */}
      <g fill="#FFFFFF">
        {GEAR_TEETH.map((deg) => (
          <rect key={deg} x="22.8" y="21.5" width="2.4" height="4" rx="1" transform={`rotate(${deg} 24 30)`} />
        ))}
        <circle cx="24" cy="30" r="5.5" />
        <circle cx="24" cy="30" r="2.3" fill="#1E3A8A" />
      </g>

      {/* barres de croissance */}
      <g fill="#FFFFFF">
        <rect x="34" y="34" width="3.2" height="8" rx="0.8" />
        <rect x="39" y="29" width="3.2" height="13" rx="0.8" />
        <rect x="44" y="23" width="3.2" height="19" rx="0.8" />
      </g>

      {/* flèche ascendante */}
      <path d="M34 27 L40 21 L46 24" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M46 24 L46 18 L40 18" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
