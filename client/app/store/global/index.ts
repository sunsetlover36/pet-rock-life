import type { IJoystickUpdateEvent } from 'react-joystick-component/build/lib/Joystick';
import { create } from 'zustand';
import type { PlayerState } from '~/types';

interface GameStore {
  playerStates: Map<string, PlayerState>;

  // Single method to update entire player state
  updatePlayerState: (id: string, state: PlayerState) => void;

  // Individual update methods for specific parts
  updatePlayerPosition: (id: string, position: PlayerState['position']) => void;
  updatePlayerRotation: (id: string, rotation: PlayerState['rotation']) => void;
  updateRockPosition: (
    id: string,
    rockPosition: PlayerState['rockPosition']
  ) => void;
  updateRockRotation: (
    id: string,
    rockRotation: PlayerState['rockRotation']
  ) => void;
  updateJoystick: (id: string, joystick: IJoystickUpdateEvent) => void;

  // Getters for convenience
  getPlayerState: (id: string) => PlayerState | undefined;
  removePlayer: (id: string) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  playerStates: new Map(),

  updatePlayerState: (id, state) => {
    get().playerStates.set(id, state);
  },

  updatePlayerPosition: (id, position) => {
    const existing = get().playerStates.get(id);
    if (existing) {
      get().playerStates.set(id, { ...existing, position });
    }
  },

  updatePlayerRotation: (id, rotation) => {
    const existing = get().playerStates.get(id);
    if (existing) {
      get().playerStates.set(id, { ...existing, rotation });
    }
  },

  updateRockPosition: (id, rockPosition) => {
    const existing = get().playerStates.get(id);
    if (existing) {
      get().playerStates.set(id, { ...existing, rockPosition });
    }
  },

  updateRockRotation: (id, rockRotation) => {
    const existing = get().playerStates.get(id);
    if (existing) {
      get().playerStates.set(id, { ...existing, rockRotation });
    }
  },

  updateJoystick: (id, joystick) => {
    const existing = get().playerStates.get(id);
    if (existing) {
      get().playerStates.set(id, { ...existing, joystick });
    }
  },

  getPlayerState: (id) => {
    return get().playerStates.get(id);
  },

  removePlayer: (id) => {
    get().playerStates.delete(id);
  },
}));
