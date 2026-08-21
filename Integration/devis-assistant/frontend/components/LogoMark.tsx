// LogoMark.tsx — logo officiel 3LM Solutions (image fournie par l'entreprise)
/* eslint-disable @next/next/no-img-element */
interface LogoMarkProps {
  size?: number;
  className?: string;
}

export default function LogoMark({ size = 40, className = '' }: LogoMarkProps) {
  return (
    <img
      src="/logo-3lm.png"
      alt="3LM Solutions"
      width={size}
      height={size}
      className={`object-cover shrink-0 ${className}`}
      style={{ width: size, height: size, objectPosition: 'top center' }}
    />
  );
}
