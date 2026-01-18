'use client';

import React, { useCallback } from 'react';
import { usePlayerContext } from '../../machine/context';

export interface SkipButtonProps {
  direction: 'forward' | 'backward';
  seconds?: number;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  showBezelStatus?: boolean;
}

export function SkipButton({
  direction,
  seconds = 10,
  icon,
  className,
  style,
  onClick,
  showBezelStatus = true,
}: SkipButtonProps) {
  const service = usePlayerContext();
  const { send } = service;

  const handleClick = useCallback(() => {
    if (direction === 'forward') {
      send({ type: 'FORWARD_SEEKING', seekToSec: seconds, showBezelStatus });
    } else {
      send({ type: 'BACKWARD_SEEKING', seekToSec: seconds, showBezelStatus });
    }
    onClick?.();
  }, [direction, seconds, send, onClick, showBezelStatus]);

  const defaultForwardIcon = (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="currentColor">
      <path d="M18 9V3l6 6-6 6v-6c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9h2c0 6.08-4.92 11-11 11S7 24.08 7 18s4.92-11 11-11z" />
      <text x="18" y="21" textAnchor="middle" fontSize="8" fontWeight="bold">10</text>
    </svg>
  );

  const defaultBackwardIcon = (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="currentColor">
      <path d="M18 9V3l-6 6 6 6v-6c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9H7c0 6.08 4.92 11 11 11s11-4.92 11-11-4.92-11-11-11z" />
      <text x="18" y="21" textAnchor="middle" fontSize="8" fontWeight="bold">10</text>
    </svg>
  );

  const defaultIcon = direction === 'forward' ? defaultForwardIcon : defaultBackwardIcon;

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
      aria-label={direction === 'forward' ? `Skip forward ${seconds} seconds` : `Skip backward ${seconds} seconds`}
    >
      {icon ?? defaultIcon}
    </button>
  );
}
