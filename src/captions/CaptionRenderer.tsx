'use client';

import React, { useEffect, useMemo } from 'react';
import { useSelector } from '@xstate/react';
import { usePlayerContext } from '../machine/context';
import {
  captionsSelector,
  playedSecondsSelector,
  captionsCurrentIndexSelector,
  currentCaptionSelector,
  captionsEnabledSelector,
} from '../machine/selectors';
import { findCaptionIndex } from './utils/parseCaption';

export interface CaptionRendererProps {
  className?: string;
  style?: React.CSSProperties;
  fontSize?: number | string;
  fontColor?: string;
  backgroundColor?: string;
  position?: 'top' | 'bottom';
  offset?: number;
}

export function CaptionRenderer({
  className,
  style,
  fontSize = '1.2rem',
  fontColor = '#fff',
  backgroundColor = 'rgba(0, 0, 0, 0.75)',
  position = 'bottom',
  offset = 60,
}: CaptionRendererProps) {
  const service = usePlayerContext();
  const { send } = service;

  const captions = useSelector(service, captionsSelector);
  const playedSeconds = useSelector(service, playedSecondsSelector);
  const currentCaption = useSelector(service, currentCaptionSelector);
  const captionsEnabled = useSelector(service, captionsEnabledSelector);

  // Update caption index based on current time
  useEffect(() => {
    const index = findCaptionIndex(captions, playedSeconds);
    send({ type: 'UPDATE_CAPTIONS_INDEX', index });
  }, [captions, playedSeconds, send]);

  if (!captionsEnabled || !currentCaption) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        ...(position === 'bottom' ? { bottom: `${offset}px` } : { top: `${offset}px` }),
        maxWidth: '80%',
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 20,
        ...style,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          padding: '8px 16px',
          backgroundColor,
          color: fontColor,
          fontSize,
          lineHeight: 1.4,
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
        }}
      >
        {currentCaption.text}
      </span>
    </div>
  );
}
