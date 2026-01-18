import { assign } from 'xstate';
import type { PlayerMachineContext, PlayerMachineEvent } from '../types';

export const setQuality = assign<PlayerMachineContext, PlayerMachineEvent>((context, event) => {
  if (event.type === 'SET_QUALITY') {
    return {
      ...context,
      currentLevel: event.level,
    };
  }
  if (event.type === 'SET_AUTO_QUALITY') {
    return {
      ...context,
      currentLevel: -1, // HLS.js auto mode
    };
  }
  return context;
});
