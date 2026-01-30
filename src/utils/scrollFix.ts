// Force enable scrolling across the entire application
export const enableScrolling = () => {
  // Remove any scroll-blocking styles
  const style = document.createElement('style');
  style.textContent = `
    html, body {
      overflow: auto !important;
      height: auto !important;
      touch-action: auto !important;
      -webkit-overflow-scrolling: touch !important;
    }
    
    * {
      overflow-y: visible !important;
      pointer-events: auto !important;
    }
    
    .min-h-screen, [data-scroll-container] {
      overflow: visible !important;
    }
  `;
  document.head.appendChild(style);

  // Force enable mouse wheel events
  const enableMouseWheel = (e: WheelEvent) => {
    // Don't prevent default - let scrolling work
    return true;
  };

  // Remove any existing wheel event listeners that might block scrolling
  document.removeEventListener('wheel', enableMouseWheel, { capture: true } as any);
  document.addEventListener('wheel', enableMouseWheel, { passive: true, capture: false });

  // Force scroll behavior
  document.documentElement.style.overflow = 'auto';
  document.body.style.overflow = 'auto';
  document.documentElement.style.height = 'auto';
  document.body.style.height = 'auto';

  // Ensure root element allows scrolling
  const root = document.getElementById('root');
  if (root) {
    root.style.overflow = 'visible';
    root.style.height = 'auto';
  }

  console.log('✅ Scrolling force-enabled');
};

// Auto-enable on load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enableScrolling);
  } else {
    enableScrolling();
  }
  
  // Re-enable after any route changes
  window.addEventListener('popstate', enableScrolling);
  
  // Re-enable periodically in case something overrides it
  setInterval(enableScrolling, 5000);
}