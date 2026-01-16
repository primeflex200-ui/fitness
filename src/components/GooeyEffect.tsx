import { useEffect, useRef } from 'react';
import './GooeyEffect.css';

interface GooeyEffectProps {
  targetElement: HTMLElement | null;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  animationTime?: number;
  timeVariance?: number;
  colors?: string[];
}

const GooeyEffect = ({
  targetElement,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  animationTime = 600,
  timeVariance = 300,
  colors = ['#3b82f6', '#22c55e', '#8b5cf6', '#ef4444', '#06b6d4']
}: GooeyEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const noise = (n = 1) => n / 2 - Math.random() * n;

  const getXY = (distance: number, pointIndex: number, totalPoints: number): [number, number] => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (i: number, t: number, d: [number, number], r: number) => {
    let rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  };

  useEffect(() => {
    if (!targetElement || !containerRef.current) return;

    const container = containerRef.current;
    const rect = targetElement.getBoundingClientRect();
    
    // Position the effect container
    container.style.left = `${rect.left + rect.width / 2}px`;
    container.style.top = `${rect.top + rect.height / 2}px`;
    container.style.opacity = '1';

    const d = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;

    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);

      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        
        particle.classList.add('gooey-particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', p.color);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);
        
        point.classList.add('gooey-point');
        particle.appendChild(point);
        container.appendChild(particle);

        setTimeout(() => {
          try {
            container.removeChild(particle);
          } catch {
            // Particle already removed
          }
        }, t);
      }, 30);
    }

    // Cleanup after animation
    const cleanup = setTimeout(() => {
      container.style.opacity = '0';
    }, bubbleTime);

    return () => clearTimeout(cleanup);
  }, [targetElement, particleCount, particleDistances, particleR, animationTime, timeVariance, colors]);

  return <div ref={containerRef} className="gooey-effect-container" />;
};

export default GooeyEffect;
