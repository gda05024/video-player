'use client';

import React, { useCallback } from 'react';
import { useSelector } from '@xstate/react';
import { usePlayerContext } from '../../machine/context';
import { isPlaySelector } from '../../machine/selectors';

export interface ScreenActionAreaProps {
  onTapCenter?: () => void;
  onTapLeft?: () => void;
  onTapRight?: () => void;
  seekSeconds?: number;
  enableTapSeek?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function ScreenActionArea({
  onTapCenter,
  onTapLeft,
  onTapRight,
  seekSeconds = 10,
  enableTapSeek = true,
  className,
  style,
}: ScreenActionAreaProps) {
  const service = usePlayerContext();
  const isPlay = useSelector(service, isPlaySelector);
  const { send } = service;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const relativeX = clickX / rect.width;

      if (enableTapSeek && relativeX < 0.33) {
        // Tap left - backward 10 seconds
        send({ type: 'BACKWARD_SEEKING', seekToSec: seekSeconds, showBezelStatus: true });
        onTapLeft?.();
      } else if (enableTapSeek && relativeX > 0.67) {
        // Tap right - forward 10 seconds
        send({ type: 'FORWARD_SEEKING', seekToSec: seekSeconds, showBezelStatus: true });
        onTapRight?.();
      } else {
        // Tap center - toggle play/pause
        if (onTapCenter) {
          onTapCenter();
        } else {
          send({ type: isPlay ? 'STOP' : 'PLAY', showBezelStatus: true });
        }
      }
      send({ type: 'SHOW_TOOLBAR' });
    },
    [isPlay, send, onTapCenter, onTapLeft, onTapRight, seekSeconds, enableTapSeek]
  );

  const handleMouseMove = useCallback(() => {
    send({ type: 'SHOW_TOOLBAR' });
  }, [send]);

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 60, // 툴바 영역 제외
        cursor: 'pointer',
        zIndex: 5,
        ...style,
      }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
    />
  );
}
