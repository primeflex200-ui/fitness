import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './Shuffle.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ShuffleProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  shuffleDirection?: 'left' | 'right';
  duration?: number;
  maxDelay?: number;
  ease?: string;
  threshold?: number;
  rootMargin?: string;
  tag?: keyof JSX.IntrinsicElements;
  textAlign?: 'left' | 'center' | 'right';
  onShuffleComplete?: () => void;
  shuffleTimes?: number;
  animationMode?: 'evenodd' | 'random';
  loop?: boolean;
  loopDelay?: number;
  stagger?: number;
  scrambleCharset?: string;
  colorFrom?: string;
  colorTo?: string;
  triggerOnce?: boolean;
  respectReducedMotion?: boolean;
  triggerOnHover?: boolean;
}

const Shuffle: React.FC<ShuffleProps> = ({
  text,
  className = '',
  style = {},
  shuffleDirection = 'right',
  duration = 0.35,
  maxDelay = 0,
  ease = 'power3.out',
  threshold = 0.1,
  rootMargin = '-100px',
  tag = 'h1',
  textAlign = 'center',
  onShuffleComplete,
  shuffleTimes = 1,
  animationMode = 'evenodd',
  loop = false,
  loopDelay = 0,
  stagger = 0.03,
  scrambleCharset = '',
  colorFrom,
  colorTo,
  triggerOnce = true,
  respectReducedMotion = true,
  triggerOnHover = false
}) => {
  const ref = useRef<HTMLElement>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const wrappersRef = useRef<HTMLElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const playingRef = useRef(false);
  const hoverHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if ('fonts' in document) {
      if (document.fonts.status === 'loaded') setFontsLoaded(true);
      else document.fonts.ready.then(() => setFontsLoaded(true));
    } else setFontsLoaded(true);
  }, []);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return;

      if (
        respectReducedMotion &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        setReady(true);
        onShuffleComplete?.();
        return;
      }

      const el = ref.current;
      const startPct = (1 - threshold) * 100;
      const mm = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin || '');
      const mv = mm ? parseFloat(mm[1]) : 0;
      const mu = mm ? mm[2] || 'px' : 'px';
      const sign = mv === 0 ? '' : mv < 0 ? `-=${Math.abs(mv)}${mu}` : `+=${mv}${mu}`;
      const start = `top ${startPct}%${sign}`;

      const removeHover = () => {
        if (hoverHandlerRef.current && ref.current) {
          ref.current.removeEventListener('mouseenter', hoverHandlerRef.current);
          hoverHandlerRef.current = null;
        }
      };

      const teardown = () => {
        if (tlRef.current) {
          tlRef.current.kill();
          tlRef.current = null;
        }
        if (wrappersRef.current.length) {
          wrappersRef.current.forEach(wrap => {
            const inner = wrap.firstElementChild as HTMLElement;
            const orig = inner?.querySelector('[data-orig="1"]') as HTMLElement;
            if (orig && wrap.parentNode) wrap.parentNode.replaceChild(orig, wrap);
          });
          wrappersRef.current = [];
        }
        playingRef.current = false;
      };

      const build = () => {
        teardown();
        
        const chars = text.split('');
        wrappersRef.current = [];
        const rolls = Math.max(1, Math.floor(shuffleTimes));
        const rand = (set: string) => set.charAt(Math.floor(Math.random() * set.length)) || '';

        el.innerHTML = '';

        chars.forEach(ch => {
          // Handle spaces specially
          if (ch === ' ') {
            const space = document.createElement('span');
            space.innerHTML = '&nbsp;';
            space.style.cssText = 'display:inline-block;width:0.3em;';
            el.appendChild(space);
            return;
          }

          const tempSpan = document.createElement('span');
          tempSpan.textContent = ch;
          tempSpan.style.cssText = 'display:inline-block;visibility:hidden;white-space:pre;';
          el.appendChild(tempSpan);
          const w = tempSpan.getBoundingClientRect().width;
          el.removeChild(tempSpan);

          if (!w) return;

          const wrap = document.createElement('span');
          Object.assign(wrap.style, {
            display: 'inline-block',
            overflow: 'hidden',
            width: w + 'px',
            verticalAlign: 'baseline'
          });

          const inner = document.createElement('span');
          Object.assign(inner.style, {
            display: 'inline-block',
            whiteSpace: 'nowrap',
            willChange: 'transform'
          });

          const firstOrig = document.createElement('span');
          firstOrig.textContent = ch;
          Object.assign(firstOrig.style, {
            display: 'inline-block',
            width: w + 'px',
            textAlign: 'center'
          });

          const realChar = document.createElement('span');
          realChar.textContent = ch;
          realChar.setAttribute('data-orig', '1');
          Object.assign(realChar.style, {
            display: 'inline-block',
            width: w + 'px',
            textAlign: 'center'
          });

          inner.appendChild(firstOrig);

          for (let k = 0; k < rolls; k++) {
            const c = document.createElement('span');
            c.textContent = scrambleCharset ? rand(scrambleCharset) : ch;
            Object.assign(c.style, {
              display: 'inline-block',
              width: w + 'px',
              textAlign: 'center'
            });
            inner.appendChild(c);
          }

          inner.appendChild(realChar);

          const steps = rolls + 1;
          let startX = 0;
          let finalX = -steps * w;

          if (shuffleDirection === 'right') {
            const firstCopy = inner.firstElementChild;
            const real = inner.lastElementChild;
            if (real) inner.insertBefore(real, inner.firstChild);
            if (firstCopy) inner.appendChild(firstCopy);
            startX = -steps * w;
            finalX = 0;
          }

          gsap.set(inner, { x: startX, force3D: true });
          if (colorFrom) inner.style.color = colorFrom;
          inner.setAttribute('data-final-x', String(finalX));
          inner.setAttribute('data-start-x', String(startX));

          wrap.appendChild(inner);
          el.appendChild(wrap);
          wrappersRef.current.push(wrap);
        });
      };

      const inners = () => wrappersRef.current.map(w => w.firstElementChild as HTMLElement);

      const randomizeScrambles = () => {
        if (!scrambleCharset) return;
        wrappersRef.current.forEach(w => {
          const strip = w.firstElementChild;
          if (!strip) return;
          const kids = Array.from(strip.children);
          for (let i = 1; i < kids.length - 1; i++) {
            (kids[i] as HTMLElement).textContent = scrambleCharset.charAt(
              Math.floor(Math.random() * scrambleCharset.length)
            );
          }
        });
      };

      const cleanupToStill = () => {
        wrappersRef.current.forEach(w => {
          const strip = w.firstElementChild as HTMLElement;
          if (!strip) return;
          const real = strip.querySelector('[data-orig="1"]') as HTMLElement;
          if (!real) return;
          strip.replaceChildren(real);
          strip.style.transform = 'none';
          strip.style.willChange = 'auto';
        });
      };

      const play = () => {
        const strips = inners();
        if (!strips.length) return;
        playingRef.current = true;

        const tl = gsap.timeline({
          smoothChildTiming: true,
          repeat: loop ? -1 : 0,
          repeatDelay: loop ? loopDelay : 0,
          onRepeat: () => {
            if (scrambleCharset) randomizeScrambles();
            gsap.set(strips, {
              x: (i, t) => parseFloat((t as HTMLElement).getAttribute('data-start-x') || '0')
            });
            onShuffleComplete?.();
          },
          onComplete: () => {
            playingRef.current = false;
            if (!loop) {
              cleanupToStill();
              if (colorTo) gsap.set(strips, { color: colorTo });
              onShuffleComplete?.();
              armHover();
            }
          }
        });

        const addTween = (targets: HTMLElement[], at: number | string) => {
          tl.to(
            targets,
            {
              x: (i, t) => parseFloat((t as HTMLElement).getAttribute('data-final-x') || '0'),
              duration,
              ease,
              force3D: true,
              stagger: animationMode === 'evenodd' ? stagger : 0
            },
            at
          );
          if (colorFrom && colorTo) {
            tl.to(targets, { color: colorTo, duration, ease }, at);
          }
        };

        if (animationMode === 'evenodd') {
          const odd = strips.filter((_, i) => i % 2 === 1);
          const even = strips.filter((_, i) => i % 2 === 0);
          const oddTotal = duration + Math.max(0, odd.length - 1) * stagger;
          const evenStart = odd.length ? oddTotal * 0.7 : 0;
          if (odd.length) addTween(odd, 0);
          if (even.length) addTween(even, evenStart);
        } else {
          strips.forEach(strip => {
            const d = Math.random() * maxDelay;
            tl.to(
              strip,
              {
                x: parseFloat(strip.getAttribute('data-final-x') || '0'),
                duration,
                ease,
                force3D: true
              },
              d
            );
            if (colorFrom && colorTo)
              tl.fromTo(strip, { color: colorFrom }, { color: colorTo, duration, ease }, d);
          });
        }

        tlRef.current = tl;
      };

      const armHover = () => {
        if (!triggerOnHover || !ref.current) return;
        removeHover();
        const handler = () => {
          if (playingRef.current) return;
          build();
          if (scrambleCharset) randomizeScrambles();
          play();
        };
        hoverHandlerRef.current = handler;
        ref.current.addEventListener('mouseenter', handler);
      };

      const create = () => {
        build();
        if (scrambleCharset) randomizeScrambles();
        play();
        armHover();
        setReady(true);
      };

      const st = ScrollTrigger.create({
        trigger: el,
        start,
        once: triggerOnce,
        onEnter: create
      });

      return () => {
        st.kill();
        removeHover();
        teardown();
        setReady(false);
      };
    },
    {
      dependencies: [
        text,
        duration,
        maxDelay,
        ease,
        threshold,
        rootMargin,
        fontsLoaded,
        shuffleDirection,
        shuffleTimes,
        animationMode,
        loop,
        loopDelay,
        stagger,
        scrambleCharset,
        colorFrom,
        colorTo,
        triggerOnce,
        respectReducedMotion,
        triggerOnHover
      ],
      scope: ref
    }
  );

  const commonStyle: React.CSSProperties = { textAlign, ...style };
  const classes = `shuffle-parent ${ready ? 'is-ready' : ''} ${className}`;
  const Tag = tag as keyof JSX.IntrinsicElements;

  return React.createElement(Tag, { ref, className: classes, style: commonStyle });
};

export default Shuffle;
