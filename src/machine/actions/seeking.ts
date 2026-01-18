import { assign } from 'xstate';
import { clamp } from '../../utils/clamp';
import type { PlayerMachineContext, PlayerMachineEvent } from '../types';

export const seeking = assign<PlayerMachineContext, PlayerMachineEvent>({
  seekNumber: (context, event) => {
    if (event.type !== 'SEEKING') return context.seekNumber;
    return clamp(event.seekTo, { min: 0, max: 1 });
  },
});

export const seeked = assign<PlayerMachineContext, PlayerMachineEvent>({
  seekNumber: () => null,
});

export function getSeekingValue(
  context: PlayerMachineContext,
  event: PlayerMachineEvent
): number | null {
  if (event.type !== 'FORWARD_SEEKING' && event.type !== 'BACKWARD_SEEKING') {
    return context.seekNumber;
  }
  const currentPlayed = context.played ?? 0;
  const duration = context.duration ?? 1;
  const direction = event.type === 'FORWARD_SEEKING' ? 1 : -1;
  const seekToSec = (event as { seekToSec: number }).seekToSec;
  const seekTo = currentPlayed + (direction * seekToSec) / duration;
  return clamp(seekTo, { min: 0, max: 1 });
}

export const forwardSeeking = assign<PlayerMachineContext, PlayerMachineEvent>({
  seekNumber: (context, event) => getSeekingValue(context, event),
});

export const backwardSeeking = assign<PlayerMachineContext, PlayerMachineEvent>({
  seekNumber: (context, event) => getSeekingValue(context, event),
});
