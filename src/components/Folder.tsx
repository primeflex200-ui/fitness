import { useState } from 'react';
import './Folder.css';

const darkenColor = (hex: string, percent: number): string => {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('');
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

interface FolderProps {
  color?: string;
  size?: number;
  className?: string;
  onOptionSelect?: (option: 'login' | 'signup' | 'google') => void;
}

const Folder = ({ 
  color = '#FFD700', 
  size = 1, 
  className = '',
  onOptionSelect 
}: FolderProps) => {
  const [open, setOpen] = useState(false);
  const [paperOffsets, setPaperOffsets] = useState([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 }
  ]);

  const folderBackColor = darkenColor(color, 0.08);

  const handleClick = () => {
    setOpen(prev => !prev);
    if (open) {
      setPaperOffsets([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }]);
    }
  };

  const handlePaperMouseMove = (e: React.MouseEvent, index: number) => {
    if (!open) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) * 0.15;
    const offsetY = (e.clientY - centerY) * 0.15;
    
    setPaperOffsets(prev => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: offsetX, y: offsetY };
      return newOffsets;
    });
  };

  const handlePaperMouseLeave = (index: number) => {
    setPaperOffsets(prev => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: 0, y: 0 };
      return newOffsets;
    });
  };

  const handleOptionClick = (option: 'login' | 'signup' | 'google', e: React.MouseEvent) => {
    e.stopPropagation();
    onOptionSelect?.(option);
  };

  const folderStyle = {
    '--folder-color': color,
    '--folder-back-color': folderBackColor,
  } as React.CSSProperties;

  const folderClassName = `folder ${open ? 'open' : ''}`.trim();
  const scaleStyle = { transform: `scale(${size})` };

  return (
    <div style={scaleStyle} className={className}>
      <div className={folderClassName} style={folderStyle} onClick={handleClick}>
        <div className="folder__back">
          {/* Login Paper */}
          <div
            className="paper paper-1 auth-paper"
            onMouseMove={e => handlePaperMouseMove(e, 0)}
            onMouseLeave={() => handlePaperMouseLeave(0)}
            onClick={(e) => handleOptionClick('login', e)}
            style={open ? {
              '--magnet-x': `${paperOffsets[0]?.x || 0}px`,
              '--magnet-y': `${paperOffsets[0]?.y || 0}px`
            } : {}}
          >
            <div className="paper-content">
              <div className="paper-icon">🔑</div>
              <div className="paper-text">Login</div>
            </div>
          </div>

          {/* Signup Paper */}
          <div
            className="paper paper-2 auth-paper"
            onMouseMove={e => handlePaperMouseMove(e, 1)}
            onMouseLeave={() => handlePaperMouseLeave(1)}
            onClick={(e) => handleOptionClick('signup', e)}
            style={open ? {
              '--magnet-x': `${paperOffsets[1]?.x || 0}px`,
              '--magnet-y': `${paperOffsets[1]?.y || 0}px`
            } : {}}
          >
            <div className="paper-content">
              <div className="paper-icon">📝</div>
              <div className="paper-text">Sign Up</div>
            </div>
          </div>

          {/* Google Signin Paper */}
          <div
            className="paper paper-3 auth-paper"
            onMouseMove={e => handlePaperMouseMove(e, 2)}
            onMouseLeave={() => handlePaperMouseLeave(2)}
            onClick={(e) => handleOptionClick('google', e)}
            style={open ? {
              '--magnet-x': `${paperOffsets[2]?.x || 0}px`,
              '--magnet-y': `${paperOffsets[2]?.y || 0}px`
            } : {}}
          >
            <div className="paper-content">
              <div className="paper-icon">🌐</div>
              <div className="paper-text">Google</div>
            </div>
          </div>

          <div className="folder__front"></div>
          <div className="folder__front right"></div>
        </div>
      </div>
    </div>
  );
};

export default Folder;