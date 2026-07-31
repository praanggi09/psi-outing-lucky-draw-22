"use client";

import { motion } from 'framer-motion';
import ShuffleNameAnimation from './ShuffleNameAnimation';
import { Winner } from '@/lib/storage';

interface WinnerCardProps {
  participantName: string;
  isRevealing: boolean;
  onRevealComplete?: () => void;
  winnerInfo?: Winner;
  onConfirm?: () => void;
  onRedraw?: () => void;
  index: number;
}

export default function WinnerCard({ 
  participantName, 
  isRevealing, 
  onRevealComplete,
  winnerInfo,
  onConfirm,
  onRedraw,
  index
}: WinnerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 100, 
        damping: 15,
        delay: index * 0.1 
      }}
      className="relative w-full max-w-4xl mx-auto"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl flex flex-col items-center text-center">
        
        {/* Name Area */}
        <div className="text-4xl md:text-6xl tracking-tight mb-8">
          <ShuffleNameAnimation 
            targetName={participantName}
            isRevealing={isRevealing}
            onRevealComplete={onRevealComplete}
            speed="fast"
          />
        </div>

        {/* Status Badge */}
        {winnerInfo?.status && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wider mb-8 ${
              winnerInfo.status === 'Confirmed' ? 'bg-white text-black' :
              winnerInfo.status === 'Pending' ? 'bg-yellow-500 text-black' :
              'bg-red-500 text-white'
            }`}
          >
            {winnerInfo.status}
          </motion.div>
        )}

        {/* Action Buttons (Only for Pending Prizes) */}
        {winnerInfo?.status === 'Pending' && winnerInfo.category !== 'doorprize' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 mt-4"
          >
            <button 
              onClick={onConfirm}
              className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Confirm Winner
            </button>
            <button 
              onClick={onRedraw}
              className="px-8 py-3 bg-transparent border border-white/30 text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
            >
              Redraw
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
