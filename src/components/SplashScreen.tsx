import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show splash for 1.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for fade out animation before calling onFinish
      setTimeout(onFinish, 300);
    }, 1500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      style={{
        animation: isVisible ? 'none' : 'fadeOut 0.3s ease-out forwards'
      }}
    >
      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes scaleIn {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.7));
          }
          50% {
            filter: drop-shadow(0 0 50px rgba(255, 215, 0, 1));
          }
        }

        .splash-logo {
          animation: scaleIn 0.6s ease-out, glow 2s ease-in-out infinite;
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
        }
      `}</style>
      
      <div className="flex flex-col items-center justify-center">
        {/* Golden Bodybuilder Logo */}
        <img 
          src="/primeflex-logo-new.jpg" 
          alt="PRIMEFLEX" 
          className="splash-logo"
          style={{ width: '80vw', maxWidth: '500px', height: 'auto', borderRadius: '20px' }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
