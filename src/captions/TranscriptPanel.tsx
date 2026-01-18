'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useSelector } from '@xstate/react';
import { usePlayerContext } from '../machine/context';
import {
  scriptsSelector,
  playedSecondsSelector,
  scriptsCurrentIndexSelector,
  durationSelector,
  transcriptEnabledSelector,
} from '../machine/selectors';
import { findCaptionIndex } from './utils/parseCaption';
import { formatTime } from '../utils/timeFormat';
import type { Caption } from '../machine/types';

export interface TranscriptPanelProps {
  className?: string;
  style?: React.CSSProperties;
  autoScroll?: boolean;
  showTimestamps?: boolean;
  onItemClick?: (caption: Caption, index: number) => void;
  highlightColor?: string;
  title?: string;
}

export function TranscriptPanel({
  className,
  style,
  autoScroll = true,
  showTimestamps = true,
  onItemClick,
  highlightColor = 'rgba(255, 255, 255, 0.1)',
  title = 'Transcript',
}: TranscriptPanelProps) {
  const service = usePlayerContext();
  const { send } = service;

  const scripts = useSelector(service, scriptsSelector);
  const playedSeconds = useSelector(service, playedSecondsSelector);
  const currentIndex = useSelector(service, scriptsCurrentIndexSelector);
  const duration = useSelector(service, durationSelector);
  const transcriptEnabled = useSelector(service, transcriptEnabledSelector);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Update script index based on current time
  useEffect(() => {
    const index = findCaptionIndex(scripts, playedSeconds);
    send({ type: 'UPDATE_SCRIPTS_INDEX', index });
  }, [scripts, playedSeconds, send]);

  // Auto scroll to current item
  useEffect(() => {
    if (!autoScroll || currentIndex < 0) return;

    const currentItem = itemRefs.current.get(currentIndex);
    if (currentItem && containerRef.current) {
      const container = containerRef.current;
      const itemTop = currentItem.offsetTop;
      const itemHeight = currentItem.offsetHeight;
      const containerHeight = container.clientHeight;
      const scrollTop = container.scrollTop;

      // Check if item is not fully visible
      if (itemTop < scrollTop || itemTop + itemHeight > scrollTop + containerHeight) {
        currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentIndex, autoScroll]);

  const handleItemClick = useCallback(
    (caption: Caption, index: number) => {
      if (duration > 0) {
        const seekTo = caption.startTime / duration;
        send({ type: 'SEEKING', seekTo });
      }
      onItemClick?.(caption, index);
    },
    [duration, send, onItemClick]
  );

  const setItemRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    if (el) {
      itemRefs.current.set(index, el);
    } else {
      itemRefs.current.delete(index);
    }
  }, []);

  if (!transcriptEnabled || scripts.length === 0) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        overflow: 'hidden',
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            fontWeight: 600,
          }}
        >
          {title}
        </div>
      )}

      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '8px 0',
        }}
      >
        {scripts.map((script, index) => (
          <div
            key={index}
            ref={setItemRef(index)}
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              backgroundColor: index === currentIndex ? highlightColor : 'transparent',
              transition: 'background-color 0.2s ease',
            }}
            onClick={() => handleItemClick(script, index)}
          >
            {showTimestamps && (
              <span
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginRight: '12px',
                }}
              >
                {formatTime(script.startTime)}
              </span>
            )}
            <span
              style={{
                fontSize: '14px',
                lineHeight: 1.5,
              }}
            >
              {script.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
