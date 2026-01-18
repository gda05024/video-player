'use client';

import React, { useCallback } from 'react';
import { useSelector } from '@xstate/react';
import { usePlayerContext } from '../../machine/context';
import { isPlaySelector } from '../../machine/selectors';

export interface CenterControlsProps {
  showPlayPause?: boolean;
  showSkipButtons?: boolean;
  skipSeconds?: number;
  playIcon?: React.ReactNode;
  pauseIcon?: React.ReactNode;
  forwardIcon?: React.ReactNode;
  backwardIcon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  buttonSize?: number;
}

export function CenterControls({
  showPlayPause = true,
  showSkipButtons = true,
  skipSeconds = 10,
  playIcon,
  pauseIcon,
  forwardIcon,
  backwardIcon,
  className,
  style,
  buttonSize = 48,
}: CenterControlsProps) {
  const service = usePlayerContext();
  const isPlay = useSelector(service, isPlaySelector);
  const { send } = service;

  const handlePlayPause = useCallback(() => {
    send({ type: isPlay ? 'STOP' : 'PLAY', showBezelStatus: true });
  }, [isPlay, send]);

  const handleBackward = useCallback(() => {
    send({ type: 'BACKWARD_SEEKING', seekToSec: skipSeconds, showBezelStatus: true });
  }, [skipSeconds, send]);

  const handleForward = useCallback(() => {
    send({ type: 'FORWARD_SEEKING', seekToSec: skipSeconds, showBezelStatus: true });
  }, [skipSeconds, send]);

  const defaultPlayIcon = (
    <svg width={buttonSize} height={buttonSize} viewBox="0 0 48 48" fill="currentColor">
      <path d="M16 10v28l22-14z" />
    </svg>
  );

  const defaultPauseIcon = (
    <svg width={buttonSize} height={buttonSize} viewBox="0 0 48 48" fill="currentColor">
      <path d="M12 10h8v28h-8zm16 0h8v28h-8z" />
    </svg>
  );

  const defaultBackwardIcon = (
    <svg width={buttonSize * 0.75} height={buttonSize * 0.75} viewBox="0 0 36 36" fill="currentColor">
      <path d="M18 9V3l-6 6 6 6v-6c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9H7c0 6.08 4.92 11 11 11s11-4.92 11-11-4.92-11-11-11z" />
      <text x="18" y="21" textAnchor="middle" fontSize="8" fontWeight="bold">{skipSeconds}</text>
    </svg>
  );

  const defaultForwardIcon = (
    <svg width={buttonSize * 0.75} height={buttonSize * 0.75} viewBox="0 0 36 36" fill="currentColor">
      <path d="M18 9V3l6 6-6 6v-6c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9h2c0 6.08-4.92 11-11 11S7 24.08 7 18s4.92-11 11-11z" />
      <text x="18" y="21" textAnchor="middle" fontSize="8" fontWeight="bold">{skipSeconds}</text>
    </svg>
  );

  const buttonStyle: React.CSSProperties = {
    background: 'rgba(0, 0, 0, 0.5)',
    border: 'none',
    cursor: 'pointer',
    color: '#fff',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s, transform 0.1s',
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        ...style,
      }}
    >
      {showSkipButtons && (
        <button
          type="button"
          style={buttonStyle}
          onClick={handleBackward}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)')}
          aria-label={`Skip backward ${skipSeconds} seconds`}
        >
          {backwardIcon ?? defaultBackwardIcon}
        </button>
      )}

      {showPlayPause && (
        <button
          type="button"
          style={{ ...buttonStyle, padding: '16px' }}
          onClick={handlePlayPause}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)')}
          aria-label={isPlay ? 'Pause' : 'Play'}
        >
          {isPlay ? (pauseIcon ?? defaultPauseIcon) : (playIcon ?? defaultPlayIcon)}
        </button>
      )}

      {showSkipButtons && (
        <button
          type="button"
          style={buttonStyle}
          onClick={handleForward}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)')}
          aria-label={`Skip forward ${skipSeconds} seconds`}
        >
          {forwardIcon ?? defaultForwardIcon}
        </button>
      )}
    </div>
  );
}
