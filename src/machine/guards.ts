import type { PlayerMachineContext, PlayerMachineEvent } from './types';

export const guards = {
  isReady: (context: PlayerMachineContext) => {
    // For non-HLS videos (e.g., YouTube), levels array will be empty
    // Just check that duration is set (video has loaded)
    return context.duration > 0;
  },
  showBezelStatus: (_context: PlayerMachineContext, event: PlayerMachineEvent) => {
    if ('showBezelStatus' in event) {
      return event.showBezelStatus === true;
    }
    return false;
  },
};
