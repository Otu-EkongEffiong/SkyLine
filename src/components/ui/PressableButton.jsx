import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Drop-in wrapper around any button/element that adds:
 *  - 95% scale press feedback
 *  - Ripple effect from tap position
 */
export default function PressableButton({ children, className, onClick, disabled, ...props }) {
  const ref = useRef(null);
  const [ripples, setRipples] = React.useState([]);

  const handleClick = (e) => {
    if (disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
    onClick?.(e);
  };

  return (
    <motion.div
      ref={ref}
      className={cn('relative overflow-hidden select-none', className)}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripples.map(({ x, y, id }) => (
        <span
          key={id}
          className="pointer-events-none absolute rounded-full bg-white/30 animate-ripple"
          style={{ left: x - 10, top: y - 10, width: 20, height: 20 }}
        />
      ))}
    </motion.div>
  );
}