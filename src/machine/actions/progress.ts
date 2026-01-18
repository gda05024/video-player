import { assign } from 'xstate';
import type { PlayerMachineContext, PlayerMachineEvent } from '../types';

export const progress = assign<PlayerMachineContext, PlayerMachineEvent>((context, event) => {
  if (event.type !== 'PROGRESS') return context;
  return {
    ...context,
    ...event.progressContext,
  };
});
