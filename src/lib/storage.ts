import { get, set, del } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';

export type Category = 'doorprize' | 'grandprize';

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

const KEYS = {
  DOORPRIZE_PARTICIPANTS: 'doorprizeParticipants',
  GRANDPRIZE_PARTICIPANTS: 'grandPrizeParticipants',
  DOORPRIZE_PRIZES: 'doorprizePrizes',
  GRANDPRIZE_PRIZES: 'grandPrizePrizes',
  WINNER_HISTORY: 'winnerHistory',
};

// Participants
export const getParticipants = async (category: Category): Promise<Participant[]> => {
  const key = category === 'doorprize' ? KEYS.DOORPRIZE_PARTICIPANTS : KEYS.GRANDPRIZE_PARTICIPANTS;
  return (await get<Participant[]>(key)) || [];
};

export const setParticipants = async (category: Category, participants: Participant[]): Promise<void> => {
  const key = category === 'doorprize' ? KEYS.DOORPRIZE_PARTICIPANTS : KEYS.GRANDPRIZE_PARTICIPANTS;
  await set(key, participants);
};

export const addParticipants = async (category: Category, newNames: string[]): Promise<void> => {
  const current = await getParticipants(category);
  const newParticipants = newNames.map(name => ({ id: uuidv4(), name }));
  await setParticipants(category, [...current, ...newParticipants]);
};

export const removeParticipant = async (category: Category, id: string): Promise<void> => {
  const current = await getParticipants(category);
  await setParticipants(category, current.filter(p => p.id !== id));
};

// Prizes
export const getPrizes = async (category: Category): Promise<Prize[]> => {
  const key = category === 'doorprize' ? KEYS.DOORPRIZE_PRIZES : KEYS.GRANDPRIZE_PRIZES;
  return (await get<Prize[]>(key)) || [];
};

export const setPrizes = async (category: Category, prizes: Prize[]): Promise<void> => {
  const key = category === 'doorprize' ? KEYS.DOORPRIZE_PRIZES : KEYS.GRANDPRIZE_PRIZES;
  await set(key, prizes);
};

export const addPrize = async (category: Category, name: string, quantity: number): Promise<void> => {
  const current = await getPrizes(category);
  await setPrizes(category, [...current, { id: uuidv4(), name, quantity }]);
};

export const updatePrize = async (category: Category, updatedPrize: Prize): Promise<void> => {
  const current = await getPrizes(category);
  await setPrizes(category, current.map(p => (p.id === updatedPrize.id ? updatedPrize : p)));
};

export const decreasePrizeQuantity = async (category: Category, id: string): Promise<void> => {
  const current = await getPrizes(category);
  await setPrizes(
    category,
    current.map(p => {
      if (p.id === id && p.quantity > 0) {
        return { ...p, quantity: p.quantity - 1 };
      }
      return p;
    })
  );
};

export const removePrize = async (category: Category, id: string): Promise<void> => {
  const current = await getPrizes(category);
  await setPrizes(category, current.filter(p => p.id !== id));
};

// Winners
export const getWinners = async (): Promise<Winner[]> => {
  return (await get<Winner[]>(KEYS.WINNER_HISTORY)) || [];
};

export const addWinner = async (winner: Omit<Winner, 'id' | 'timestamp'>): Promise<Winner> => {
  const current = await getWinners();
  const newWinner: Winner = { ...winner, id: uuidv4(), timestamp: Date.now() };
  await set(KEYS.WINNER_HISTORY, [...current, newWinner]);
  return newWinner;
};

export const updateWinnerStatus = async (id: string, status: Winner['status']): Promise<void> => {
  const current = await getWinners();
  await set(
    KEYS.WINNER_HISTORY,
    current.map(w => (w.id === id ? { ...w, status } : w))
  );
};

export const clearWinners = async (): Promise<void> => {
  await set(KEYS.WINNER_HISTORY, []);
};
