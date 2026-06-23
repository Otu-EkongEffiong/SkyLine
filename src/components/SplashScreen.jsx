import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';


export default function SplashScreen({ isExiting = false, onExitComplete = () => {} }) {
  const logoVariants = {
    enter: {
      scale: 0.8,
      opacity: 0,
      y: 50,
    },
    center: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
    exit: {
      scale: 0.5,
      opacity: 0,
      y: -100,
      transition: {
        duration: 0.6,
        ease: 'easeIn',
      },
    },
  };

  const containerVariants = {
    enter: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5,
        delay: 0.4,
      },
    },
  };

  return (
    <motion.div
      initial="enter"
      animate={isExiting ? 'exit' : 'center'}
      variants={containerVariants}
      onAnimationComplete={isExiting ? onExitComplete : undefined}
      className="fixed inset-0 z-50 bg-gradient-to-br from-sky-400 via-teal-400 to-green-400 flex items-center justify-center"
    >
      <motion.div variants={logoVariants}>
        <img
          src="/src/assets/icon.svg"
          alt="SkyLine Logo"
          className="h-32 w-auto object-contain drop-shadow-xl"
        />
      </motion.div>
    </motion.div>
  );
}