import React from 'react';
import { motion } from 'motion/react';

interface ConfettiPiece {
  id: number;
  x: number; // initial horizontal % (0 to 100)
  delay: number; // seconds
  size: number; // px
  color: string;
  rotation: number;
  shape: 'rect' | 'circle' | 'strip';
}

const COLORS = [
  '#A3E635', // lime
  '#38BDF8', // sky
  '#F43F5E', // rose
  '#FBBF24', // amber
  '#A855F7', // purple
  '#34D399', // emerald
  '#FFFFFF', // white
];

export const Confetti: React.FC = () => {
  // Generate 45 confetti pieces with deterministic layout
  const pieces: ConfettiPiece[] = Array.from({ length: 45 }).map((_, i) => ({
    id: i,
    x: (i * 7) % 96 + 2,
    delay: (i % 9) * 0.15,
    size: (i % 3 === 0 ? 10 : i % 3 === 1 ? 14 : 7),
    color: COLORS[i % COLORS.length],
    rotation: (i * 37) % 360,
    shape: i % 4 === 0 ? 'circle' : i % 4 === 1 ? 'strip' : 'rect',
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            top: -20,
            left: `${p.x}%`,
            opacity: 1,
            rotate: p.rotation,
            scale: 0.8,
          }}
          animate={{
            top: '110%',
            left: `${p.x + ((p.id % 2 === 0 ? 1 : -1) * (10 + (p.id % 15)))}%`,
            opacity: [1, 1, 0.9, 0],
            rotate: p.rotation + 720,
            scale: [0.8, 1.2, 0.9],
          }}
          transition={{
            duration: 2.8 + (p.id % 5) * 0.4,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: p.shape === 'strip' ? p.size * 1.8 : p.size,
            height: p.shape === 'strip' ? p.size * 0.4 : p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'strip' ? '2px' : '3px',
          }}
        />
      ))}
    </div>
  );
};
