'use client';

import React from 'react';
import { useSelector } from '@xstate/react';
import { usePlayerContext } from '../../machine/context';
import { playedSelector, durationSelector } from '../../machine/selectors';
import { formatTime } from '../../utils/timeFormat';

export interface TimeDisplayProps {
  className?: string;
  style?: React.CSSProperties;
  separator?: string;
}

export function TimeDisplay({
  className,
  style,
  separator = ' / ',
}: TimeDisplayProps) {
  const service = usePlayerContext();
  const played = useSelector(service, playedSelector);
  const duration = useSelector(service, durationSelector);

  const currentTime = duration * played;

  return (
    <span
      className={className}
      style={{
        color: '#fff',
        fontSize: '13px',
        fontFamily: 'Roboto, Arial, sans-serif',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {formatTime(currentTime)}{separator}{formatTime(duration)}
    </span>
  );
}
