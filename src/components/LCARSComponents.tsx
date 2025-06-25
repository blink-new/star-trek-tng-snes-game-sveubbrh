import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// LCARS Color Palette
export const LCARS_COLORS = {
  // Primary LCARS colors
  orange: '#FF9900',
  lightBlue: '#99CCFF',
  blue: '#0099FF',
  purple: '#CC99FF',
  red: '#FF6666',
  green: '#99FF99',
  yellow: '#FFFF99',
  
  // Status colors
  critical: '#FF0000',
  warning: '#FFFF00',
  normal: '#00FF00',
  offline: '#666666',
  
  // Background colors
  dark1: '#000000',
  dark2: '#111111',
  dark3: '#222222',
  panel: '#1a1a2e',
  
  // Text colors
  text: '#FFFFFF',
  textDim: '#CCCCCC',
  textBright: '#FFFFFF'
};

// LCARS Button Component
interface LCARSButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'standard' | 'pill' | 'rounded';
  disabled?: boolean;
  active?: boolean;
  className?: string;
}

export const LCARSButton: React.FC<LCARSButtonProps> = ({
  children,
  onClick,
  color = LCARS_COLORS.orange,
  size = 'medium',
  variant = 'standard',
  disabled = false,
  active = false,
  className = ''
}) => {
  const sizeClasses = {
    small: 'px-3 py-1 text-xs',
    medium: 'px-6 py-2 text-sm',
    large: 'px-8 py-3 text-base'
  };

  const variantClasses = {
    standard: 'rounded-none',
    pill: 'rounded-full',
    rounded: 'rounded-lg'
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.05, brightness: 1.2 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={disabled ? undefined : onClick}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        font-bold uppercase tracking-wider
        border-2 transition-all duration-200
        relative overflow-hidden
        ${disabled 
          ? 'opacity-50 cursor-not-allowed bg-gray-600 border-gray-600 text-gray-400' 
          : 'hover:shadow-lg active:shadow-inner cursor-pointer'
        }
        ${active ? 'animate-pulse' : ''}
        ${className}
      `}
      style={disabled ? {} : {
        backgroundColor: color + '20',
        borderColor: color,
        color: color,
        boxShadow: `0 0 10px ${color}40, inset 0 0 10px ${color}20`
      }}
    >
      {/* Animated background sweep */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 opacity-20"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatType: 'loop',
            ease: 'linear'
          }}
          style={{ 
            background: `linear-gradient(90deg, transparent, ${color}, transparent)` 
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

// LCARS Panel Component
interface LCARSPanelProps {
  children: React.ReactNode;
  title?: string;
  color?: string;
  className?: string;
  variant?: 'standard' | 'curved' | 'angular';
}

export const LCARSPanel: React.FC<LCARSPanelProps> = ({
  children,
  title,
  color = LCARS_COLORS.blue,
  className = '',
  variant = 'standard'
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'curved':
        return 'rounded-tl-3xl rounded-br-3xl';
      case 'angular':
        return 'clip-path-angular';
      default:
        return 'rounded-lg';
    }
  };

  return (
    <div 
      className={`
        bg-black border-2 p-4 relative overflow-hidden
        ${getVariantStyle()}
        ${className}
      `}
      style={{ borderColor: color }}
    >
      {/* Animated border glow */}
      <div 
        className="absolute inset-0 rounded-lg animate-pulse"
        style={{ 
          boxShadow: `inset 0 0 20px ${color}30, 0 0 20px ${color}20` 
        }}
      />
      
      {/* Panel header */}
      {title && (
        <div 
          className="absolute -top-3 left-4 px-2 text-xs font-bold uppercase tracking-wider bg-black"
          style={{ color }}
        >
          {title}
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// LCARS Progress Bar
interface LCARSProgressProps {
  value: number;
  max?: number;
  color?: string;
  label?: string;
  animated?: boolean;
  className?: string;
}

export const LCARSProgress: React.FC<LCARSProgressProps> = ({
  value,
  max = 100,
  color = LCARS_COLORS.orange,
  label,
  animated = true,
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
          <span style={{ color }}>{label}</span>
          <span className="text-white">{value}/{max}</span>
        </div>
      )}
      <div className="relative h-4 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 0.5 : 0, ease: 'easeOut' }}
        >
          {/* Animated highlight */}
          <motion.div
            className="absolute inset-0 opacity-60"
            animate={{ 
              background: [
                `linear-gradient(90deg, transparent, ${color}FF, transparent)`,
                `linear-gradient(90deg, transparent, ${color}AA, transparent)`,
                `linear-gradient(90deg, transparent, ${color}FF, transparent)`
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>
    </div>
  );
};

// LCARS Status Display
interface LCARSStatusProps {
  status: 'online' | 'offline' | 'warning' | 'critical';
  label: string;
  value?: string | number;
  className?: string;
}

export const LCARSStatus: React.FC<LCARSStatusProps> = ({
  status,
  label,
  value,
  className = ''
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online': return LCARS_COLORS.normal;
      case 'offline': return LCARS_COLORS.offline;
      case 'warning': return LCARS_COLORS.warning;
      case 'critical': return LCARS_COLORS.critical;
      default: return LCARS_COLORS.blue;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online': return 'ONLINE';
      case 'offline': return 'OFFLINE';
      case 'warning': return 'WARNING';
      case 'critical': return 'CRITICAL';
      default: return 'UNKNOWN';
    }
  };

  return (
    <div className={`flex items-center justify-between p-2 bg-gray-900 rounded ${className}`}>
      <div className="flex items-center space-x-2">
        <motion.div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: getStatusColor() }}
          animate={{ 
            opacity: status === 'critical' ? [1, 0.3, 1] : 1,
            scale: status === 'warning' ? [1, 1.2, 1] : 1
          }}
          transition={{ 
            duration: 1, 
            repeat: status === 'critical' || status === 'warning' ? Infinity : 0 
          }}
        />
        <span className="text-white text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        {value && (
          <span className="text-white text-sm">{value}</span>
        )}
        <span 
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: getStatusColor() }}
        >
          {getStatusText()}
        </span>
      </div>
    </div>
  );
};

// LCARS Data Display
interface LCARSDataProps {
  data: { label: string; value: string | number; color?: string }[];
  title?: string;
  className?: string;
}

export const LCARSData: React.FC<LCARSDataProps> = ({
  data,
  title,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {title && (
        <h3 className="text-lg font-bold uppercase tracking-wider text-orange-400 mb-3">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center p-2 bg-gray-900 rounded">
            <span className="text-gray-300 text-sm uppercase tracking-wide">
              {item.label}
            </span>
            <span 
              className="font-mono text-sm font-bold"
              style={{ color: item.color || LCARS_COLORS.text }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// LCARS Alert System
interface LCARSAlertProps {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  visible: boolean;
  onClose?: () => void;
  duration?: number;
}

export const LCARSAlert: React.FC<LCARSAlertProps> = ({
  type,
  message,
  visible,
  onClose,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  const getAlertColor = () => {
    switch (type) {
      case 'info': return LCARS_COLORS.blue;
      case 'warning': return LCARS_COLORS.yellow;
      case 'error': return LCARS_COLORS.red;
      case 'success': return LCARS_COLORS.green;
      default: return LCARS_COLORS.blue;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <div 
            className="p-4 rounded-lg border-2 bg-black text-white"
            style={{ 
              borderColor: getAlertColor(),
              boxShadow: `0 0 20px ${getAlertColor()}40`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getAlertColor() }}
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-sm font-medium">{message}</span>
              </div>
              {onClose && (
                <button
                  onClick={() => {
                    setIsVisible(false);
                    onClose();
                  }}
                  className="text-gray-400 hover:text-white ml-4"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// LCARS Terminal Component
interface LCARSTerminalProps {
  lines: string[];
  prompt?: string;
  onCommand?: (command: string) => void;
  className?: string;
}

export const LCARSTerminal: React.FC<LCARSTerminalProps> = ({
  lines,
  prompt = '>',
  onCommand,
  className = ''
}) => {
  const [currentInput, setCurrentInput] = useState('');
  const [displayLines, setDisplayLines] = useState<string[]>([]);

  useEffect(() => {
    // Simulate typing effect
    const typeLines = async () => {
      for (let i = 0; i < lines.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setDisplayLines(prev => [...prev, lines[i]]);
      }
    };
    
    if (lines.length > displayLines.length) {
      typeLines();
    }
  }, [lines, displayLines.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim() && onCommand) {
      onCommand(currentInput.trim());
      setCurrentInput('');
    }
  };

  return (
    <div className={`bg-black border-2 border-green-500 rounded-lg p-4 font-mono text-sm ${className}`}>
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {displayLines.map((line, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-400"
          >
            {line}
          </motion.div>
        ))}
      </div>
      
      {onCommand && (
        <form onSubmit={handleSubmit} className="flex items-center mt-2">
          <span className="text-green-400 mr-2">{prompt}</span>
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            className="flex-1 bg-transparent text-green-400 outline-none caret-green-400"
            autoFocus
          />
        </form>
      )}
    </div>
  );
};