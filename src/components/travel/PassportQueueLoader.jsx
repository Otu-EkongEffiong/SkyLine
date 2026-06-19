import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const messages = [
  'Checking visa databases...',
  'Consulting embassy records...',
  'Fetching current policies...',
  'Almost there...',
];

function MainCharacter({ checkingWatch }) {
  return (
    <div className="relative flex flex-col items-center">

      {/* Head */}
      <motion.div
        className="w-10 h-10 rounded-full bg-[#FBBF6A] border-2 border-[#F4A553] relative shadow"
        animate={{ rotate: checkingWatch ? -20 : 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      >
        {/* Eyes */}
        <motion.div
          className="absolute top-3 left-2 w-1.5 h-1.5 rounded-full bg-slate-800"
          animate={{ scaleY: checkingWatch ? 0.3 : 1 }}
          transition={{ duration: 0.2 }}
        />
        <motion.div
          className="absolute top-3 right-2 w-1.5 h-1.5 rounded-full bg-slate-800"
          animate={{ scaleY: checkingWatch ? 0.3 : 1 }}
          transition={{ duration: 0.2 }}
        />
        {/* Eyebrows */}
        <motion.div
          className="absolute top-1.5 left-1.5 w-2 h-0.5 bg-slate-700 rounded"
          animate={{ rotate: checkingWatch ? -15 : 0, y: checkingWatch ? -1 : 0 }}
        />
        <motion.div
          className="absolute top-1.5 right-1.5 w-2 h-0.5 bg-slate-700 rounded"
          animate={{ rotate: checkingWatch ? 15 : 0, y: checkingWatch ? -1 : 0 }}
        />
        {/* Mouth */}
        <motion.div
          className="absolute bottom-2 left-1/2 -translate-x-1/2"
          animate={checkingWatch ? { width: 8, height: 4 } : { width: 12, height: 4 }}
        >
          <svg viewBox="0 0 12 6" width="100%" height="100%">
            <motion.path
              d={checkingWatch ? 'M1 4 Q6 1 11 4' : 'M1 1 Q6 5 11 1'}
              stroke="#555"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              animate={{ d: checkingWatch ? 'M1 4 Q6 1 11 4' : 'M1 1 Q6 5 11 1' }}
              transition={{ duration: 0.4 }}
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Body */}
      <div className="w-9 h-11 rounded-t-2xl bg-sky-500 border-2 border-sky-600 relative shadow mt-0.5">
        {/* Tie/stripe detail */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-6 bg-sky-700 rounded-b-lg opacity-60" />
        {/* Passport */}
        <motion.div
          className="absolute -right-5 top-1 w-5 h-7 bg-red-700 rounded shadow-md border border-red-900 flex items-center justify-center"
          animate={{ rotate: checkingWatch ? [0, 5, -5, 0] : 0, y: checkingWatch ? -2 : 0 }}
          transition={{ duration: 0.5, repeat: checkingWatch ? 0 : 0 }}
        >
          <div className="text-yellow-300 text-[8px] text-center leading-none">🌐</div>
          <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-red-500 opacity-50 mx-0.5" />
        </motion.div>
      </div>

      {/* Legs */}
      <div className="flex gap-1 mt-0.5">
        <motion.div
          className="w-3.5 h-6 bg-slate-700 rounded-b-lg"
          animate={{ rotate: [0, 4, 0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originY: 0 }}
        />
        <motion.div
          className="w-3.5 h-6 bg-slate-700 rounded-b-lg"
          animate={{ rotate: [0, -4, 0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originY: 0 }}
        />
      </div>

      {/* Suitcase */}
      <motion.div
        className="absolute -left-12 bottom-0"
        animate={{ x: [0, 1.5, -1.5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-10 h-12 bg-sky-700 rounded-xl border-2 border-sky-800 relative shadow-md">
          {/* Handle */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-3 border-2 border-sky-500 rounded-t-lg" />
          {/* Stripes */}
          <div className="absolute top-2.5 left-1.5 right-1.5 h-0.5 bg-sky-400/60 rounded" />
          <div className="absolute top-4.5 left-1.5 right-1.5 h-0.5 bg-sky-400/60 rounded" />
          {/* Lock */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-2 bg-sky-300 rounded-sm" />
        </div>
        {/* Wheels */}
        <div className="flex justify-between px-1">
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-slate-500 border border-slate-400"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-slate-500 border border-slate-400"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </motion.div>
    </div>
  );
}

function BackPerson({ color, delay, xOffset }) {
  return (
    <motion.div
      className="flex flex-col items-center relative"
      style={{ marginRight: xOffset }}
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <div className="w-7 h-7 rounded-full border-2" style={{ backgroundColor: color.skin, borderColor: color.skinBorder }} />
      <div className="w-6 h-9 rounded-t-xl border" style={{ backgroundColor: color.shirt, borderColor: color.shirtBorder }} />
      <div className="flex gap-0.5">
        <div className="w-2.5 h-5 bg-slate-600 rounded-b" />
        <div className="w-2.5 h-5 bg-slate-600 rounded-b" />
      </div>
      {/* Bag */}
      <motion.div
        className="absolute -right-4 bottom-5 w-5 h-6 rounded border-2 shadow-sm"
        style={{ backgroundColor: color.bag, borderColor: color.bagBorder }}
        animate={{ rotate: [0, 3, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay }}
      />
    </motion.div>
  );
}

function PassportControlBooth() {
  return (
    <div className="relative ml-8 flex flex-col items-end" style={{ zIndex: 10 }}>
      {/* Officer */}
      <div className="relative flex flex-col items-center mb-0.5">
        <div className="w-8 h-8 rounded-full bg-[#FBBF6A] border-2 border-[#F4A553] relative">
          {/* Officer hat */}
          <div className="absolute -top-2 left-0 right-0 h-3 bg-slate-800 rounded-t-full border-b-2 border-slate-600" />
          <div className="absolute top-2.5 left-1.5 w-1 h-1 rounded-full bg-slate-700" />
          <div className="absolute top-2.5 right-1.5 w-1 h-1 rounded-full bg-slate-700" />
        </div>
        <div className="w-8 h-6 rounded-t-lg bg-slate-700 border border-slate-600" />
      </div>
      {/* Booth */}
      <div className="w-12 h-24 bg-slate-200 dark:bg-slate-600 border-2 border-slate-300 dark:border-slate-500 rounded-t-xl flex flex-col items-center justify-start pt-2 shadow-md">
        {/* Screen */}
        <motion.div
          className="w-8 h-8 bg-sky-100 dark:bg-sky-900 border border-sky-300 dark:border-sky-600 rounded flex items-center justify-center mb-1"
          animate={{ backgroundColor: ['#e0f2fe', '#bfdbfe', '#e0f2fe'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.span
            className="text-base"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >🛂</motion.span>
        </motion.div>
        <div className="text-[5px] font-bold text-slate-500 dark:text-slate-400 text-center leading-tight uppercase tracking-wide">
          Passport<br/>Control
        </div>
        {/* Blinking light */}
        <motion.div
          className="w-2 h-2 rounded-full bg-green-400 mt-2 shadow"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      </div>
    </div>
  );
}

export default function PassportQueueLoader() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [checkingWatch, setCheckingWatch] = useState(false);

  useEffect(() => {
    const msgTimer = setInterval(() => setMsgIndex(i => (i + 1) % messages.length), 2000);

    // Watch-check sequence: raise arm, hold, lower
    const watchSequence = () => {
      setCheckingWatch(true);
      setTimeout(() => setCheckingWatch(false), 1800);
    };
    watchSequence();
    const watchTimer = setInterval(watchSequence, 4000);

    return () => { clearInterval(msgTimer); clearInterval(watchTimer); };
  }, []);

  return (
    <div className="bg-gradient-to-b from-slate-50 to-sky-50 dark:from-slate-800/80 dark:to-slate-900/60 rounded-2xl p-8 flex flex-col items-center gap-5 select-none">

      {/* Sky / setting */}
      <div className="relative w-72 flex items-end justify-center">
        {/* Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-600 rounded-full" />

        {/* Back person 2 */}
        <BackPerson
          delay={0.8}
          xOffset={12}
          color={{ skin: '#FBBF6A', skinBorder: '#F4A553', shirt: '#A78BFA', shirtBorder: '#7C3AED', bag: '#7C3AED', bagBorder: '#5B21B6' }}
        />

        {/* Back person 1 */}
        <BackPerson
          delay={0.4}
          xOffset={10}
          color={{ skin: '#FCA5A5', skinBorder: '#F87171', shirt: '#34D399', shirtBorder: '#059669', bag: '#065F46', bagBorder: '#064E3B' }}
        />

        {/* Main character */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
          style={{ zIndex: 5 }}
        >
          <MainCharacter checkingWatch={checkingWatch} />
        </motion.div>

        {/* Booth */}
        <PassportControlBooth />
      </div>

      {/* Thought bubble — clock */}
      <AnimatePresence>
        {checkingWatch && (
          <motion.div
            key="thought"
            initial={{ opacity: 0, scale: 0.4, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.4, y: 14 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative flex flex-col items-center"
          >
            {/* Bubble tail dots */}
            <div className="flex gap-1 mb-1 ml-[-60px]">
              <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-600 shadow" />
              <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-slate-600 shadow" />
            </div>
            {/* Main bubble */}
            <div className="bg-white dark:bg-slate-700 rounded-3xl px-5 py-4 shadow-lg border border-slate-100 dark:border-slate-600 flex flex-col items-center gap-2">
              {/* Clock face */}
              <div className="relative w-14 h-14 rounded-full bg-white dark:bg-slate-800 border-4 border-slate-700 dark:border-slate-400 shadow-inner flex items-center justify-center">
                {/* Hour markers */}
                {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-1.5 bg-slate-400 rounded"
                    style={{ transform: `rotate(${i * 30}deg) translateY(-22px)` }}
                  />
                ))}
                {/* Hour hand */}
                <motion.div
                  className="absolute w-1 h-4 bg-slate-800 dark:bg-slate-200 rounded-full"
                  style={{ originY: '100%', bottom: '50%' }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                />
                {/* Minute hand */}
                <motion.div
                  className="absolute w-0.5 h-5 bg-slate-600 dark:bg-slate-400 rounded-full"
                  style={{ originY: '100%', bottom: '50%' }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
                {/* Second hand */}
                <motion.div
                  className="absolute w-0.5 h-5 bg-red-500 rounded-full"
                  style={{ originY: '100%', bottom: '50%' }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                />
                {/* Center dot */}
                <div className="absolute w-2 h-2 rounded-full bg-slate-800 dark:bg-slate-200 z-10" />
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
                How long is this?! 😤
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated dots */}
      <div className="flex gap-2 items-center">
        {[0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-sky-400"
            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Rotating status message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={msgIndex}
          className="text-sm font-medium text-slate-500 dark:text-slate-400"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
        >
          {messages[msgIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}