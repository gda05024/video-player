'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useInterpret } from '@xstate/react';
import type { InterpreterFrom } from 'xstate';
import { playerMachine } from './playerMachine';

export type PlayerService = InterpreterFrom<typeof playerMachine>;

export const PlayerContext = createContext<PlayerService | null>(null);

export interface PlayerProviderProps {
  children: ReactNode;
  onVolumeChange?: (volume: number) => void;
  onSpeedChange?: (speed: number) => void;
  onQualityChange?: (quality: string) => void;
  onFullScreenChange?: (isFullScreen: boolean) => void;
  onPlayRateChange?: (playRate: number) => void;
}

export function PlayerProvider({
  children,
  onVolumeChange,
  onSpeedChange,
  onQualityChange,
  onFullScreenChange,
  onPlayRateChange,
}: PlayerProviderProps) {
  const service = useInterpret(playerMachine, {
    actions: {
      onVolumeChange: (context, event) => {
        if (event.type === 'SET_VOLUME' || event.type === 'VOLUME_UP' || event.type === 'VOLUME_DOWN') {
          onVolumeChange?.(context.volume);
        }
        return context;
      },
      onSpeedChange: (context, event) => {
        if (event.type === 'SET_SPEED') {
          onSpeedChange?.(context.speed);
          onPlayRateChange?.(context.speed);
        }
        return context;
      },
      onQualityChange: (context, event) => {
        if (event.type === 'SET_QUALITY' && context.levels[event.level]) {
          onQualityChange?.(`${context.levels[event.level].width}p`);
        }
        return context;
      },
      onFullScreenChange: (context, event) => {
        if (event.type === 'ENTER_FULLSCREEN') {
          onFullScreenChange?.(true);
        } else if (event.type === 'EXIT_FULLSCREEN') {
          onFullScreenChange?.(false);
        }
        return context;
      },
    },
  });

  return <PlayerContext.Provider value={service}>{children}</PlayerContext.Provider>;
}

export function usePlayerContext(): PlayerService {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
}

export function usePlayerContextOptional(): PlayerService | null {
  return useContext(PlayerContext);
}
