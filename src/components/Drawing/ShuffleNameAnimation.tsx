"use client";

import { useEffect, useState, useRef } from 'react';

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

interface ShuffleNameAnimationProps {
  targetName: string;
  isRevealing: boolean;
  onRevealComplete?: () => void;
  speed?: 'fast' | 'slow';
}

export default function ShuffleNameAnimation({ 
  targetName, 
  isRevealing, 
  onRevealComplete,
  speed = 'fast'
}: ShuffleNameAnimationProps) {
  const [displayText, setDisplayText] = useState('');
  const lockIndexRef = useRef(0);
  const frameRef = useRef<number>(0);
  const [isComplete, setIsComplete] = useState(false);

  const onRevealCompleteRef = useRef(onRevealComplete);

  useEffect(() => {
    onRevealCompleteRef.current = onRevealComplete;
  }, [onRevealComplete]);

  useEffect(() => {
    if (!isRevealing) {
      // If not revealing yet, show random full scramble
      let frame = 0;
      const animateScramble = () => {
        if (frame % 3 === 0) { // Throttle update slightly for visual comfort
          let scrambled = '';
          for (let i = 0; i < 10; i++) {
            scrambled += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          setDisplayText(scrambled);
        }
        frame++;
        frameRef.current = requestAnimationFrame(animateScramble);
      };
      
      frameRef.current = requestAnimationFrame(animateScramble);
      return () => cancelAnimationFrame(frameRef.current);
    }

    // Start locking sequence
    lockIndexRef.current = 0;
    setIsComplete(false);

    let frame = 0;
    const animateLock = () => {
      frame++;
      
      // Adjust speed based on prop (4 frames for fast, 10 frames for slow)
      const frameMod = speed === 'slow' ? 10 : 4;
      if (frame % frameMod === 0 && lockIndexRef.current < targetName.length) {
        lockIndexRef.current += 1;
      }

      const lockedPart = targetName.substring(0, lockIndexRef.current);
      let scrambledPart = '';
      
      for (let i = lockIndexRef.current; i < targetName.length; i++) {
        // If it's a space, just keep it as space
        if (targetName[i] === ' ') {
          scrambledPart += ' ';
        } else {
          scrambledPart += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }

      setDisplayText(lockedPart + scrambledPart);

      if (lockIndexRef.current < targetName.length) {
        frameRef.current = requestAnimationFrame(animateLock);
      } else {
        setDisplayText(targetName);
        setIsComplete(true);
        if (onRevealCompleteRef.current) onRevealCompleteRef.current();
      }
    };

    frameRef.current = requestAnimationFrame(animateLock);

    return () => cancelAnimationFrame(frameRef.current);
  }, [isRevealing, targetName]);

  return (
    <div className={`font-mono font-bold transition-all duration-500 ${isComplete ? 'bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-yellow-500/70 tracking-widest'}`}>
      {displayText}
    </div>
  );
}
