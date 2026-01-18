'use client';

import React, { useCallback } from 'react';
import { useSelector } from '@xstate/react';
import { usePlayerContext } from '../../machine/context';
import { isPlaySelector } from '../../machine/selectors';

export interface PlayButtonProps {
  playIcon?: React.ReactNode;
  pauseIcon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function PlayButton({
  playIcon,
  pauseIcon,
  className,
  style,
  onClick,
}: PlayButtonProps) {
  const service = usePlayerContext();
  const isPlay = useSelector(service, isPlaySelector);
  const { send } = service;

  const handleClick = useCallback(() => {
    send({ type: isPlay ? 'STOP' : 'PLAY' });
    onClick?.();
  }, [isPlay, send, onClick]);

  const defaultPlayIcon = (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="currentColor">
      <path d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z" />
    </svg>
  );

  const defaultPauseIcon = (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="currentColor">
      <path d="M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z" />
    </svg>
  );

  return (
    <button
      type="button"
      className={className}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: '#fff',
        padding: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        transition: 'background-color 0.2s',
        ...style,
      }}
      onClick={handleClick}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      aria-label={isPlay ? 'Pause' : 'Play'}
    >
      {isPlay ? (pauseIcon ?? defaultPauseIcon) : (playIcon ?? defaultPlayIcon)}
    </button>
  );
}
