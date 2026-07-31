"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getParticipants, 
  getPrizes, 
  addWinner, 
  updateWinnerStatus, 
  removeParticipantByName, 
  decreasePrizeQuantity, 
  Category, 
  Prize, 
  Participant, 
  Winner 
} from '@/lib/storage';
import WinnerCard from '@/components/Drawing/WinnerCard';
import CustomDropdown from '@/components/Drawing/CustomDropdown';
import ShuffleNameAnimation from '@/components/Drawing/ShuffleNameAnimation';

import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type DrawingState = 'READY' | 'DRAWING' | 'REVEALING' | 'WAITING_CONFIRMATION' | 'COMPLETED';

interface ActiveSlot {
  id: string;
  participant: Participant;
  isRevealing: boolean;
  isRevealed: boolean;
  winnerRecord?: Winner;
}

export default function DrawingPage() {
  const [category, setCategory] = useState<Category>('doorprize');
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedPrizeId, setSelectedPrizeId] = useState<string>('');
  const [drawingPrize, setDrawingPrize] = useState<Prize | null>(null);
  
  const [drawingState, setDrawingState] = useState<DrawingState>('READY');
  const [activeSlots, setActiveSlots] = useState<ActiveSlot[]>([]);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);
  const [errorDialogMessage, setErrorDialogMessage] = useState<string | null>(null);

  const loadData = async () => {
    const data = await getPrizes(category);
    const available = data.filter(p => p.quantity > 0);
    setPrizes(available);
    if (available.length > 0 && !available.find(p => p.id === selectedPrizeId)) {
      setSelectedPrizeId(available[0].id);
    } else if (available.length === 0) {
      setSelectedPrizeId('');
    }
    
    const poolCategory = category === 'specialprize' ? 'grandprize' : category;
    const parts = await getParticipants(poolCategory);
    setParticipants(parts);
  };

  // Load prizes when category changes
  useEffect(() => {
    loadData();
  }, [category]);

  const selectedPrize = prizes.find(p => p.id === selectedPrizeId);

  const startDrawing = async () => {
    if (!selectedPrize) return;
    setDrawingPrize(selectedPrize);
    
    if (participants.length < selectedPrize.quantity) {
      setErrorDialogMessage(`Not enough participants! Need ${selectedPrize.quantity}, but only have ${participants.length}.`);
      return;
    }

    // Pick random winners
    const safeQuantity = Math.max(1, Number(selectedPrize.quantity) || 1);
    const shuffled = [...participants].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, safeQuantity);

    if (picked.length === 0) {
      setErrorDialogMessage("Failed to pick participants. Please check your prize quantity.");
      return;
    }

    const slots: ActiveSlot[] = picked.map((p, idx) => ({
      id: `slot-${idx}-${Date.now()}`,
      participant: p,
      isRevealing: false,
      isRevealed: false
    }));

    setActiveSlots(slots);
    setDrawingState('DRAWING');
    
    // After a global scramble, start revealing one by one
    setTimeout(() => {
      setDrawingState('REVEALING');
      setCurrentRevealIndex(0);
    }, category === 'doorprize' ? 1500 : 3000);
  };

  // Handle sequential reveal
  useEffect(() => {
    if (drawingState === 'REVEALING' && currentRevealIndex >= 0 && currentRevealIndex < activeSlots.length) {
      
      // Start revealing the current slot
      setActiveSlots(prev => prev.map((s, i) => 
        i === currentRevealIndex ? { ...s, isRevealing: true } : s
      ));

    }
  }, [drawingState, currentRevealIndex]);

  const handleRevealComplete = async (index: number) => {
    if (drawingState !== 'REVEALING' && drawingState !== 'WAITING_CONFIRMATION') return;

    const slot = activeSlots[index];
    if (!drawingPrize) return;

    let updatedSlot = { ...slot, isRevealed: true, isRevealing: false };

    // Process logic based on category
    if (category === 'doorprize') {
      // Auto confirm for doorprize
      const winnerData = await addWinner({
        participantId: slot.participant.id,
        participantName: slot.participant.name,
        prizeId: drawingPrize.id,
        prizeName: drawingPrize.name,
        category: category,
        status: 'Confirmed'
      });
      await removeParticipantByName(slot.participant.name);
      await decreasePrizeQuantity(category, drawingPrize.id);
      
      updatedSlot.winnerRecord = winnerData;
    } else {
      // Grand prize needs confirmation
      // Only create pending record if it doesn't exist (e.g. not a redraw)
      if (!updatedSlot.winnerRecord) {
        const winnerData = await addWinner({
          participantId: slot.participant.id,
          participantName: slot.participant.name,
          prizeId: drawingPrize.id,
          prizeName: drawingPrize.name,
          category: category,
          status: 'Pending'
        });
        updatedSlot.winnerRecord = winnerData;
      }
    }

    setActiveSlots(prev => prev.map((s, i) => i === index ? updatedSlot : s));

    // Wait before revealing next, or finish
    setTimeout(() => {
      if (index + 1 < activeSlots.length) {
        // Only automatically move to next if we are in REVEALING phase (not if we just finished a redraw)
        if (drawingState === 'REVEALING') {
          setCurrentRevealIndex(index + 1);
        }
      } else {
        // All revealed
        if (category !== 'doorprize') {
          // Only set to waiting if we haven't already completed or reset it
          setDrawingState(prev => (prev === 'COMPLETED' || prev === 'READY') ? prev : 'WAITING_CONFIRMATION');
        } else {
          setDrawingState('COMPLETED');
          // Reload prizes to reflect quantity decrease
          getPrizes(category).then(data => {
             const available = data.filter(p => p.quantity > 0);
             setPrizes(available);
             if (!available.find(p => p.id === selectedPrizeId) && available.length > 0) {
               setSelectedPrizeId(available[0].id);
             }
          });
        }
      }
    }, category === 'doorprize' ? 150 : 2500); // 0.15s pause for doorprize, 2.5s for grandprize
  };

  const handleConfirm = async (index: number) => {
    try {
      const slot = activeSlots[index];
      if (!slot.winnerRecord || !drawingPrize || slot.winnerRecord.status !== 'Pending') return;

      const updatedRecord = { ...slot.winnerRecord, status: 'Confirmed' as const };
      
      // Calculate if all will be confirmed after this action
      const isAllConfirmed = activeSlots.every((s, i) => i === index || s.winnerRecord?.status === 'Confirmed');

      setActiveSlots(prev => prev.map((s, i) => i === index ? { ...s, winnerRecord: updatedRecord } : s));

      await Promise.all([
        updateWinnerStatus(slot.winnerRecord.id, 'Confirmed'),
        removeParticipantByName(slot.participant.name),
        decreasePrizeQuantity(category, drawingPrize.id)
      ]);

      if (isAllConfirmed) {
        setDrawingState('COMPLETED');
        // Reload prizes to reflect quantity decrease
        const data = await getPrizes(category);
        const available = data.filter(p => p.quantity > 0);
        setPrizes(available);
        if (!available.find(p => p.id === selectedPrizeId) && available.length > 0) {
          setSelectedPrizeId(available[0].id);
        }
      }
    } catch (e) {
      console.error(e);
      setErrorDialogMessage("An error occurred while confirming. Please try again.");
    }
  };

  const handleRedraw = async (index: number) => {
    try {
      const currentSlot = activeSlots[index];
      if (!currentSlot.winnerRecord || !drawingPrize || currentSlot.winnerRecord.status !== 'Pending') return;

      // Optimistically update status to prevent double clicks
      setActiveSlots(prev => prev.map((s, i) => i === index ? { ...s, winnerRecord: { ...s.winnerRecord!, status: 'Redrawn' } } : s));

      // Execute side effects outside of React's state setter
      await Promise.all([
        updateWinnerStatus(currentSlot.winnerRecord.id, 'Redrawn'),
        removeParticipantByName(currentSlot.participant.name)
      ]);
      // Ensure we don't pick someone who is currently active in ANY slot
      const activeIds = activeSlots.map(s => s.participant.id);
      const available = participants.filter(p => !activeIds.includes(p.id));

      if (available.length === 0) {
        setErrorDialogMessage("No more participants available to redraw!");
        return;
      }

      const newParticipant = available[Math.floor(Math.random() * available.length)];

      setActiveSlots(prev => prev.map((s, i) => i === index ? {
        ...s,
        participant: newParticipant,
        isRevealing: true,
        isRevealed: false,
        winnerRecord: undefined
      } : s));
    } catch (e) {
      console.error(e);
      setErrorDialogMessage("Failed to redraw. Please check your connection.");
    }
  };

  const resetDrawing = () => {
    setDrawingState('READY');
    setActiveSlots([]);
    setCurrentRevealIndex(-1);
    
    // Refresh data in background for the next draw
    loadData();
  };

  return (
    <div 
      className="min-h-screen text-foreground flex flex-col items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {/* Dark overlay for contrast */}
      <div className={`absolute inset-0 z-0 pointer-events-none transition-colors duration-1000 ${drawingState === 'READY' ? 'bg-black/50' : 'bg-black/85'}`}></div>


      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-12 left-0 right-0 flex flex-col items-center z-10"
      >

        {selectedPrize && drawingState === 'READY' && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">Prize</p>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              {selectedPrize.name}
            </h1>
          </div>
        )}
      </motion.div>

      {/* Main Content Area */}
      <div className="w-full max-w-[1600px] px-4 md:px-8 mt-32 z-10 flex flex-col items-center">
        
        {/* Controls (Only visible in READY state) */}
        <AnimatePresence mode="wait">
          {drawingState === 'READY' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: 50 }}
              className="flex flex-col items-center space-y-12"
            >
              <div className="flex gap-4">
                <button
                  onClick={() => setCategory('doorprize')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${category === 'doorprize' ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
                >
                  Doorprize
                </button>
                <button
                  onClick={() => setCategory('specialprize')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${category === 'specialprize' ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
                >
                  Special Prize
                </button>
                <button
                  onClick={() => setCategory('grandprize')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${category === 'grandprize' ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
                >
                  Grand Prize
                </button>
              </div>

              {prizes.length > 0 ? (
                <div className="flex flex-col items-center space-y-8">
                  <CustomDropdown 
                    prizes={prizes}
                    selectedPrizeId={selectedPrizeId}
                    onSelect={setSelectedPrizeId}
                  />

                  <button 
                    onClick={startDrawing}
                    className="mt-12 px-12 py-5 text-xl font-black tracking-widest uppercase bg-white text-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]"
                  >
                    Start Drawing
                  </button>
                </div>
              ) : (
                <div className="text-xl text-muted-foreground border border-white/10 p-8 rounded-2xl bg-white/5 backdrop-blur-sm">
                  No prizes available in this category.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drawing & Revealing State */}
        {(drawingState !== 'READY') && (
          <div className="w-full flex flex-col space-y-8 pb-32">
            
            {/* Header when drawing */}
            <div className="text-center mb-12">
              <h3 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 tracking-tight drop-shadow-lg pb-2">
                {drawingPrize?.name}
              </h3>
            </div>

            {category === 'doorprize' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                className="relative w-full mx-auto"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-3xl blur-xl opacity-50"></div>
                <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-4 md:p-8 shadow-2xl flex flex-col items-center">
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-6 w-full">
                    {activeSlots.map((slot, index) => (
                      <div key={slot.id} className="flex flex-col items-center justify-center text-center w-full sm:w-[45%] md:w-[30%] lg:w-[22%] xl:w-[18%]">
                        {(slot.isRevealing || slot.isRevealed || drawingState === 'DRAWING' || drawingState === 'REVEALING') && (
                          <div className="relative w-full py-3 px-2 flex items-center justify-center">
                            {/* Subtle highlight behind the name */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-lg"></div>
                            
                            <div className="relative text-xl md:text-2xl lg:text-3xl tracking-tight text-white leading-tight break-words">
                              <ShuffleNameAnimation 
                                targetName={slot.participant.name}
                                isRevealing={slot.isRevealing || slot.isRevealed}
                                onRevealComplete={() => handleRevealComplete(index)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col space-y-6">
                {activeSlots.map((slot, index) => (
                  <div key={slot.id} className="w-full">
                    {(slot.isRevealing || slot.isRevealed || drawingState === 'DRAWING' || drawingState === 'REVEALING') && (
                      <WinnerCard 
                        participantName={slot.participant.name}
                        isRevealing={slot.isRevealing || slot.isRevealed}
                        onRevealComplete={() => handleRevealComplete(index)}
                        winnerInfo={slot.winnerRecord}
                        onConfirm={() => handleConfirm(index)}
                        onRedraw={() => handleRedraw(index)}
                        index={index}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Next Drawing Button */}
            <AnimatePresence>
              {drawingState === 'COMPLETED' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="fixed bottom-12 left-0 right-0 flex justify-center z-50"
                >
                  <button 
                    onClick={resetDrawing}
                    className="px-10 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold tracking-widest uppercase rounded-xl hover:bg-white/20 transition-all shadow-xl"
                  >
                    Next Drawing
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

      </div>

      {/* Error Notification Dialog */}
      <Dialog open={!!errorDialogMessage} onOpenChange={(open) => !open && setErrorDialogMessage(null)}>
        <DialogContent showCloseButton={false} className="sm:max-w-md bg-[#0a0a0a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-500 text-xl font-bold flex items-center gap-2">
              ⚠️ Notification
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-base mt-2">
              {errorDialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end border-t border-white/10 mt-6 pt-4 bg-transparent">
            <Button variant="outline" onClick={() => setErrorDialogMessage(null)} className="border-white/20 text-white hover:bg-white/10">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
