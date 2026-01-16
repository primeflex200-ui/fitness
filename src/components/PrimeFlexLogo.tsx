import { Dumbbell } from 'lucide-react';

interface PrimeFlexLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const PrimeFlexLogo = ({ className = "", showText = false, size = 'md' }: PrimeFlexLogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/primeflex-logo-new.jpg" 
        alt="PRIMEFLEX" 
        className={`${sizeClasses[size]} rounded-lg object-cover`}
      />
      {showText && (
        <span className={`font-bold text-gradient-gold tracking-wide ${textSizeClasses[size]}`}>
          PRIME FLEX
        </span>
      )}
    </div>
  );
};

export default PrimeFlexLogo;
