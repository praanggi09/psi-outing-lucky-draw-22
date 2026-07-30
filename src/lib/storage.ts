"use server";

import { prisma } from './db';
import { revalidatePath } from 'next/cache';

export type Category = 'doorprize' | 'specialprize' | 'grandprize';

export interface Participant {
  id: string;
  name: string;
}

export interface Prize {
  id: string;
  name: string;
  quantity: number;
}

export interface Winner {
  id: string;
  participantId: string;
  participantName: string;
  prizeId: string;
  prizeName: string;
  category: Category;
  status: 'Pending' | 'Confirmed' | 'Redrawn';
  timestamp: number;
}

// Participants
export const getParticipants = async (category: Category): Promise<Participant[]> => {
  const data = await prisma.participant.findMany({
    where: { category },
    orderBy: { createdAt: 'asc' }
  });
  return data.map(d => ({ id: d.id, name: d.name }));
};

export const addParticipants = async (category: Category, newNames: string[]): Promise<void> => {
  await prisma.participant.createMany({
    data: newNames.map(name => ({ name, category }))
  });
  revalidatePath('/admin/participants');
  revalidatePath('/');
};

export const removeParticipant = async (category: Category, id: string): Promise<void> => {
  await prisma.participant.delete({
    where: { id }
  });
  revalidatePath('/admin/participants');
  revalidatePath('/');
};

export const removeParticipantByName = async (name: string): Promise<void> => {
  await prisma.participant.deleteMany({
    where: { name }
  });
  revalidatePath('/admin/participants');
  revalidatePath('/');
};

export const clearParticipants = async (category: Category): Promise<void> => {
  await prisma.participant.deleteMany({
    where: { category }
  });
  revalidatePath('/admin/participants');
  revalidatePath('/');
};

// Prizes
export const getPrizes = async (category: Category): Promise<Prize[]> => {
  const data = await prisma.prize.findMany({
    where: { category },
    orderBy: { createdAt: 'asc' }
  });
  return data.map(d => ({ id: d.id, name: d.name, quantity: d.quantity }));
};

export const addPrize = async (category: Category, name: string, quantity: number): Promise<void> => {
  await prisma.prize.create({
    data: { name, quantity, category }
  });
  revalidatePath('/admin/prizes');
  revalidatePath('/');
};

export const updatePrize = async (category: Category, updatedPrize: Prize): Promise<void> => {
  await prisma.prize.update({
    where: { id: updatedPrize.id },
    data: { name: updatedPrize.name, quantity: updatedPrize.quantity }
  });
  revalidatePath('/admin/prizes');
  revalidatePath('/');
};

export const decreasePrizeQuantity = async (category: Category, id: string): Promise<void> => {
  await prisma.prize.updateMany({
    where: { id, quantity: { gt: 0 } },
    data: { quantity: { decrement: 1 } }
  });
  revalidatePath('/admin/prizes');
  revalidatePath('/');
};

export const removePrize = async (category: Category, id: string): Promise<void> => {
  await prisma.prize.delete({
    where: { id }
  });
  revalidatePath('/admin/prizes');
  revalidatePath('/');
};

export const clearPrizes = async (category: Category): Promise<void> => {
  await prisma.prize.deleteMany({
    where: { category }
  });
  revalidatePath('/admin/prizes');
  revalidatePath('/');
};

// Winners
export const getWinners = async (): Promise<Winner[]> => {
  const data = await prisma.winner.findMany({
    orderBy: { timestamp: 'asc' }
  });
  return data.map(w => ({
    ...w,
    category: w.category as Category,
    status: w.status as Winner['status'],
    timestamp: w.timestamp.getTime()
  }));
};

export const addWinner = async (winner: Omit<Winner, 'id' | 'timestamp'>): Promise<Winner> => {
  const newWinner = await prisma.winner.create({
    data: {
      ...winner,
      timestamp: new Date()
    }
  });
  revalidatePath('/admin/winners');
  revalidatePath('/');
  return {
    ...newWinner,
    category: newWinner.category as Category,
    status: newWinner.status as Winner['status'],
    timestamp: newWinner.timestamp.getTime()
  };
};

export const updateWinnerStatus = async (id: string, status: Winner['status']): Promise<void> => {
  await prisma.winner.update({
    where: { id },
    data: { status }
  });
  revalidatePath('/admin/winners');
  revalidatePath('/');
};

export const clearWinners = async (): Promise<void> => {
  await prisma.winner.deleteMany({});
  revalidatePath('/admin/winners');
  revalidatePath('/');
};
