'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useSelector } from '@xstate/react';
import { usePlayerContext } from '../../machine/context';
import { speedSelector } from '../../machine/selectors';

export interface SpeedMenuProps {
  speeds?: number[];
  className?: string;
  style?: React.CSSProperties;
  menuStyle?: React.CSSProperties;
  renderTrigger?: (speed: number, isOpen: boolean) => React.ReactNode;
}

const DEFAULT_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function SpeedMenu({
  speeds = DEFAULT_SPEEDS,
  className,
  style,
  menuStyle,
  renderTrigger,
}: SpeedMenuProps) {
  const service = usePlayerContext();
  const speed = useSelector(service, speedSelector);
  const { send } = service;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSpeedChange = useCallback(
    (newSpeed: number) => {
      send({ type: 'SET_SPEED', speed: newSpeed });
      setIsOpen(false);
    },
    [send]
  );

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const formatSpeed = (s: number) => (s === 1 ? 'Normal' : `${s}x`);

  const defaultTrigger = (
    <button
      type="button"
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: '#fff',
        padding: '8px',
        fontSize: '14px',
        fontWeight: 500,
      }}
      onClick={() => setIsOpen(!isOpen)}
      aria-label="Playback speed"
    >
      {formatSpeed(speed)}
    </button>
  );

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        ...style,
      }}
    >
      {renderTrigger ? (
        <div onClick={() => setIsOpen(!isOpen)}>{renderTrigger(speed, isOpen)}</div>
      ) : (
        defaultTrigger
      )}

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            marginBottom: '8px',
            backgroundColor: 'rgba(28, 28, 28, 0.95)',
            borderRadius: '8px',
            padding: '8px 0',
            minWidth: '120px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            zIndex: 100,
            ...menuStyle,
          }}
        >
          {speeds.map((s) => (
            <button
              key={s}
              type="button"
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 16px',
                background: s === speed ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '14px',
                textAlign: 'left',
              }}
              onClick={() => handleSpeedChange(s)}
            >
              {formatSpeed(s)}
              {s === speed && (
                <span style={{ float: 'right' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
