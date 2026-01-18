import { assign } from 'xstate';
import type { PlayerMachineContext, PlayerMachineEvent } from '../types';

export const setSpeed = assign<PlayerMachineContext, PlayerMachineEvent>((context, event) => {
  if (event.type !== 'SET_SPEED') return context;
  return {
    ...context,
    speed: event.speed,
  };
});
