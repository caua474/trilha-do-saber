import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ConfettiItem {
  id: number;
  x: number;
  yOffset: number;
  size: number;
  color: string;
  shape: 'rect' | 'circle' | 'star' | 'ribbon';
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  duration: number;
  delay: number;
  xSway: number;
}

const CONFETTI_COLORS = [
  '#f59e0b', '#10b981', '#6366f1', '#ec4899',
  '#3b82f6', '#8b5cf6', '#f43f5e', '#eab308',
  '#06b6d4', '#d946ef', '#14b8a6', '#f97316'
];

export interface CelebrationConfettiProps {
  active: boolean;
  type?: 'xp' | 'streak' | 'achievement' | 'general';
  title?: string;
  subtitle?: string;
  badge?: string;
  onComplete?: () => void;
}

export const CelebrationConfetti: React.FC<CelebrationConfettiProps> = ({
  active,
  type = 'general',
  title,
  subtitle,
  badge,
  onComplete,
}) => {
  const [pieces, setPieces] = useState<ConfettiItem[]>([]);

  useEffect(() => {
    if (active) {
      const items: ConfettiItem[] = [];
      const count = 90;
      for (let i = 0; i < count; i++) {
        items.push({
          id: Math.random() + i + Date.now(),
          x: Math.random() * 100,
          yOffset: -10 - Math.random() * 25,
          size: 7 + Math.random() * 14,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          shape: (['rect', 'circle', 'ribbon', 'star'] as const)[Math.floor(Math.random() * 4)],
          rotateX: Math.random() * 720 - 360,
          rotateY: Math.random() * 720 - 360,
          rotateZ: Math.random() * 1080 - 540,
          duration: 2.6 + Math.random() * 1.8,
          delay: Math.random() * 0.5,
          xSway: (Math.random() - 0.5) * 160,
        });
      }
      setPieces(items);

      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 3500);

      return () => clearTimeout(timer);
    } else {
      setPieces([]);
    }
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[80] overflow-hidden">
      {/* Confetti Rain Layer */}
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              opacity: 1,
              top: `${p.yOffset}%`,
              left: `${p.x}%`,
              scale: 0.8,
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
            }}
            animate={{
              opacity: [1, 1, 1, 0],
              top: ['-5%', '45%', '115%'],
              left: [`${p.x}%`, `${p.x + p.xSway * 0.05}%`, `${p.x + p.xSway * 0.1}%`],
              rotateX: p.rotateX,
              rotateY: p.rotateY,
              rotateZ: p.rotateZ,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            style={{
              position: 'absolute',
              width: p.shape === 'ribbon' ? p.size * 0.4 : p.size,
              height: p.shape === 'ribbon' ? p.size * 2.2 : p.size,
              backgroundColor: p.color,
              borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'rect' ? '2px' : '1px',
              boxShadow: `0 2px 10px ${p.color}90`,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Floating Celebration Banner with Framer Motion */}
      {(title || subtitle) && (
        <div className="absolute top-16 sm:top-20 inset-x-0 flex justify-center px-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.85 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: [0.95, 1.03, 1],
            }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 22,
              duration: 0.6,
            }}
            className="pointer-events-auto bg-gradient-to-r from-slate-900/95 via-indigo-950/95 to-slate-900/95 border-2 border-amber-400/80 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-amber-500/20 max-w-md w-full backdrop-blur-md text-center flex flex-col items-center gap-2 relative overflow-hidden"
          >
            {/* Glow accent */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

            {badge && (
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40"
              >
                {badge}
              </motion.span>
            )}

            {title && (
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                {title}
              </h3>
            )}

            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                {subtitle}
              </p>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
