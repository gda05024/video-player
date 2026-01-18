'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useSelector } from '@xstate/react';
import { usePlayerContext } from '../../machine/context';
import {
  playedSelector,
  loadedSelector,
  durationSelector,
} from '../../machine/selectors';
import { formatTime } from '../../utils/timeFormat';

export interface ProgressBarProps {
  showTime?: boolean;
  showBuffered?: boolean;
  className?: string;
  style?: React.CSSProperties;
  trackColor?: string;
  bufferedColor?: string;
  playedColor?: string;
  thumbColor?: string;
  height?: number;
}

export function ProgressBar({
  showTime = true,
  showBuffered = true,
  className,
  style,
  trackColor = 'rgba(255, 255, 255, 0.2)',
  bufferedColor = 'rgba(255, 255, 255, 0.4)',
  playedColor = '#f00',
  thumbColor = '#f00',
  height = 3,
}: ProgressBarProps) {
  const service = usePlayerContext();
  const played = useSelector(service, playedSelector);
  const loaded = useSelector(service, loadedSelector);
  const duration = useSelector(service, durationSelector);
  const { send } = service;

  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);

  const getPositionFromEvent = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const position = (clientX - rect.left) / rect.width;
      return Math.max(0, Math.min(1, position));
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      const position = getPositionFromEvent(e.clientX);
      send({ type: 'SEEKING', seekTo: position });
    },
    [getPositionFromEvent, send]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const position = getPositionFromEvent(e.clientX);
      setHoverPosition(position);
      if (isDragging) {
        send({ type: 'SEEKING', seekTo: position });
      }
    },
    [getPositionFromEvent, isDragging, send]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverPosition(null);
    setIsHovering(false);
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  const currentTime = duration * played;
  const hoverTime = hoverPosition !== null ? duration * hoverPosition : null;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        ...style,
      }}
    >
      <div
        ref={trackRef}
        style={{
          flex: 1,
          height: isHovering || isDragging ? `${height * 2}px` : `${height}px`,
          backgroundColor: trackColor,
          borderRadius: `${height}px`,
          position: 'relative',
          cursor: 'pointer',
          transition: 'height 0.1s ease',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Buffered progress */}
        {showBuffered && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${loaded * 100}%`,
              backgroundColor: bufferedColor,
              borderRadius: `${height / 2}px`,
              transition: 'width 0.1s ease',
            }}
          />
        )}

        {/* Played progress */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${played * 100}%`,
            backgroundColor: playedColor,
            borderRadius: `${height / 2}px`,
            transition: isDragging ? 'none' : 'width 0.1s ease',
          }}
        />

        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            left: `${played * 100}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${height * 3}px`,
            height: `${height * 3}px`,
            backgroundColor: thumbColor,
            borderRadius: '50%',
            opacity: isDragging || hoverPosition !== null ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        />

        {/* Hover time tooltip */}
        {hoverTime !== null && (
          <div
            style={{
              position: 'absolute',
              left: `${hoverPosition! * 100}%`,
              bottom: '100%',
              transform: 'translateX(-50%)',
              marginBottom: '8px',
              padding: '4px 8px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              fontSize: '12px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      {showTime && (
        <span style={{ color: '#fff', fontSize: '13px', fontFamily: 'Roboto, Arial, sans-serif' }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      )}
    </div>
  );
}
