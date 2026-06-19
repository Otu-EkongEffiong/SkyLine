import React from 'react';
import { motion } from 'framer-motion';

/**
 * Wraps any icon and plays a small bounce animation on click.
 */
export default function BounceIcon({ children, className }) {
  const [bounce, setBounce] = React.useState(false);

  const handleClick = () => {
    setBounce(true);
    setTimeout(() => setBounce(false), 400);
  };

  return (
    <motion.span
      className={className}
      animate={bounce ? { y: [-4, 0] } : { y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={handleClick}
    >
      {children}
    </motion.span>
  );
}