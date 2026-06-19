import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// Order matches the bottom nav order
const PAGE_ORDER = ['Profile', 'Home', 'MyTrips', 'Settings'];

function getPageIndex(pathname) {
  const name = pathname.replace(/^\//, '');
  return PAGE_ORDER.indexOf(name);
}

const directionRef = { current: 1 };

export default function PageTransition({ children }) {
  const location = useLocation();
  const prevPathname = useRef(location.pathname);

  if (prevPathname.current !== location.pathname) {
    const prevIdx = getPageIndex(prevPathname.current);
    const currIdx = getPageIndex(location.pathname);
    // Only set direction for known nav pages; otherwise keep previous direction
    if (prevIdx !== -1 && currIdx !== -1) {
      directionRef.current = currIdx > prevIdx ? 1 : -1;
    }
    prevPathname.current = location.pathname;
  }

  const variants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.18, ease: 'easeIn' },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.12, ease: 'easeOut' },
    },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}