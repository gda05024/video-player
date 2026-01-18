import { assign } from 'xstate';
import type { PlayerMachineContext, PlayerMachineEvent } from '../types';

export const ready = assign<PlayerMachineContext, PlayerMachineEvent>((context, event) => {
  if (event.type !== 'READY') return context;
  return {
    ...context,
    ...event.readyContext,
  };
});
