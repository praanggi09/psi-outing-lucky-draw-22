"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Prize } from '@/lib/storage';

interface CustomDropdownProps {
  prizes: Prize[];
  selectedPrizeId: string;
  onSelect: (id: string) => void;
}

export default function CustomDropdown({ prizes, selectedPrizeId, onSelect }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedPrize = prizes.find(p => p.id === selectedPrizeId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-80 md:w-96 z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white px-6 py-4 rounded-xl transition-all shadow-lg"
      >
        <span className="text-xl font-bold truncate">
          {selectedPrize ? `${selectedPrize.name} (x${selectedPrize.quantity})` : 'Select Prize'}
        </span>
        <ChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto custom-scrollbar"
          >
            {prizes.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  onSelect(p.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-6 py-4 hover:bg-white/10 transition-colors text-lg font-medium flex justify-between items-center ${selectedPrizeId === p.id ? 'bg-white/20 text-white border-l-2 border-white' : 'text-white/80'}`}
              >
                <span className="truncate">{p.name}</span>
                <span className={`text-sm ml-4 font-bold ${selectedPrizeId === p.id ? 'text-white' : 'text-white/50'}`}>
                  x{p.quantity}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
