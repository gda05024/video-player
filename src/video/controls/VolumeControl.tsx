'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useSelector } from '@xstate/react';
import { usePlayerContext } from '../../machine/context';
import { volumeSelector, mutedSelector } from '../../machine/selectors';

export interface VolumeControlProps {
  muteIcon?: React.ReactNode;
  volumeLowIcon?: React.ReactNode;
  volumeHighIcon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  sliderWidth?: number;
  expandOnHover?: boolean;
}

export function VolumeControl({
  muteIcon,
  volumeLowIcon,
  volumeHighIcon,
  className,
  style,
  sliderWidth = 80,
  expandOnHover = true,
}: VolumeControlProps) {
  const service = usePlayerContext();
  const volume = useSelector(service, volumeSelector);
  const muted = useSelector(service, mutedSelector);
  const { send } = service;

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const effectiveVolume = muted ? 0 : volume;

  const handleMuteToggle = useCallback(() => {
    send({ type: 'SET_MUTED', muted: !muted });
  }, [muted, send]);

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      send({ type: 'SET_VOLUME', volume: clampedVolume });
    },
    [send]
  );

  const getVolumeFromEvent = useCallback(
    (clientX: number): number => {
      if (!sliderRef.current) return volume;
      const rect = sliderRef.current.getBoundingClientRect();
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    },
    [volume]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      handleVolumeChange(getVolumeFromEvent(e.clientX));
    },
    [getVolumeFromEvent, handleVolumeChange]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        handleVolumeChange(getVolumeFromEvent(e.clientX));
      }
    },
    [isDragging, getVolumeFromEvent, handleVolumeChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  // Google Material Icons
  const defaultMuteIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  );

  const defaultVolumeLowIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
    </svg>
  );

  const defaultVolumeHighIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );

  const getVolumeIcon = () => {
    if (muted || effectiveVolume === 0) {
      return muteIcon ?? defaultMuteIcon;
    }
    if (effectiveVolume < 0.5) {
      return volumeLowIcon ?? defaultVolumeLowIcon;
    }
    return volumeHighIcon ?? defaultVolumeHighIcon;
  };

  const showSlider = !expandOnHover || isHovered || isDragging;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#fff',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={handleMuteToggle}
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {getVolumeIcon()}
      </button>

      <div
        ref={sliderRef}
        style={{
          width: showSlider ? `${sliderWidth}px` : '0px',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '2px',
          position: 'relative',
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'width 0.2s ease',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${effectiveVolume * 100}%`,
            backgroundColor: '#fff',
            borderRadius: '2px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${effectiveVolume * 100}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '12px',
            height: '12px',
            backgroundColor: '#fff',
            borderRadius: '50%',
            opacity: showSlider ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
}
