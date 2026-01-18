import { assign } from 'xstate';
import { clamp } from '../../utils/clamp';
import type { PlayerMachineContext, PlayerMachineEvent } from '../types';

export const setVolume = assign<PlayerMachineContext, PlayerMachineEvent>((context, event) => {
  if (event.type !== 'SET_VOLUME') return context;
  const volume = clamp(event.volume, { min: 0, max: 1 });
  return {
    ...context,
    volume,
    muted: volume === 0,
  };
});

export const volumeUp = assign<PlayerMachineContext, PlayerMachineEvent>((context, event) => {
  if (event.type !== 'VOLUME_UP') return context;
  const volume = clamp((context.volume ?? 0) + event.volume, { min: 0, max: 1 });
  return {
    ...context,
    volume,
    muted: volume === 0,
  };
});

export const volumeDown = assign<PlayerMachineContext, PlayerMachineEvent>((context, event) => {
  if (event.type !== 'VOLUME_DOWN') return context;
  const volume = clamp((context.volume ?? 0) - event.volume, { min: 0, max: 1 });
  return {
    ...context,
    volume,
    muted: volume === 0,
  };
});

export const setMuted = assign<PlayerMachineContext, PlayerMachineEvent>((context, event) => {
  if (event.type !== 'SET_MUTED') return context;
  return {
    ...context,
    muted: event.muted,
  };
});
