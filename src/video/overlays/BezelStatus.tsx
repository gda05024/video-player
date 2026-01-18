'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from '@xstate/react';
import { usePlayerContext } from '../../machine/context';
import { bezelStatusSelector, type SelectState } from '../../machine/selectors';
import type { BezelStatusType } from '../../machine/types';

export interface BezelStatusProps {
  playIcon?: React.ReactNode;
  pauseIcon?: React.ReactNode;
  forwardIcon?: React.ReactNode;
  backwardIcon?: React.ReactNode;
  volumeUpIcon?: React.ReactNode;
  volumeDownIcon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}

export function BezelStatus({
  playIcon,
  pauseIcon,
  forwardIcon,
  backwardIcon,
  volumeUpIcon,
  volumeDownIcon,
  className,
  style,
  size = 64,
}: BezelStatusProps) {
  const service = usePlayerContext();
  const bezelStatus = useSelector(service, bezelStatusSelector);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (bezelStatus) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(timer);
    }
  }, [bezelStatus]);

  const defaultPlayIcon = (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );

  const defaultPauseIcon = (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );

  const defaultForwardIcon = (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
    </svg>
  );

  const defaultBackwardIcon = (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
    </svg>
  );

  const defaultVolumeUpIcon = (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );

  const defaultVolumeDownIcon = (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
    </svg>
  );

  const getIcon = (status: BezelStatusType) => {
    switch (status) {
      case 'play':
        return playIcon ?? defaultPlayIcon;
      case 'stop':
        return pauseIcon ?? defaultPauseIcon;
      case 'forward':
        return forwardIcon ?? defaultForwardIcon;
      case 'backward':
        return backwardIcon ?? defaultBackwardIcon;
      case 'volume-up':
        return volumeUpIcon ?? defaultVolumeUpIcon;
      case 'volume-down':
        return volumeDownIcon ?? defaultVolumeDownIcon;
      default:
        return null;
    }
  };

  if (!bezelStatus || !visible) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '50%',
        padding: '16px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        animation: 'bezel-fade 0.4s ease-out forwards',
        ...style,
      }}
    >
      {getIcon(bezelStatus)}
      <style>
        {`
          @keyframes bezel-fade {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(1.2);
            }
          }
        `}
      </style>
    </div>
  );
}
