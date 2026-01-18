'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useSelector } from '@xstate/react';
import { usePlayerContext } from '../../machine/context';
import {
  currentLevelSelector,
  levelsSelector,
  isAutoQualitySelector,
} from '../../machine/selectors';

export interface QualityMenuProps {
  className?: string;
  style?: React.CSSProperties;
  menuStyle?: React.CSSProperties;
  icon?: React.ReactNode;
  autoLabel?: string;
  renderTrigger?: (currentQuality: string, isOpen: boolean) => React.ReactNode;
}

export function QualityMenu({
  className,
  style,
  menuStyle,
  icon,
  autoLabel = 'Auto',
  renderTrigger,
}: QualityMenuProps) {
  const service = usePlayerContext();
  const currentLevel = useSelector(service, currentLevelSelector);
  const levels = useSelector(service, levelsSelector);
  const isAutoQuality = useSelector(service, isAutoQualitySelector);
  const { send } = service;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleQualityChange = useCallback(
    (level: number) => {
      if (level === -1) {
        send({ type: 'SET_AUTO_QUALITY' });
      } else {
        send({ type: 'SET_QUALITY', level });
      }
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

  const getCurrentQualityLabel = () => {
    if (isAutoQuality || currentLevel === -1) {
      return autoLabel;
    }
    const level = levels[currentLevel];
    if (level) {
      return `${level.height}p`;
    }
    return autoLabel;
  };

  const defaultIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
  );

  if (levels.length === 0) {
    return null;
  }

  const defaultTrigger = (
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
        gap: '4px',
      }}
      onClick={() => setIsOpen(!isOpen)}
      aria-label="Video quality"
    >
      {icon ?? defaultIcon}
      <span style={{ fontSize: '12px' }}>{getCurrentQualityLabel()}</span>
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
        <div onClick={() => setIsOpen(!isOpen)}>
          {renderTrigger(getCurrentQualityLabel(), isOpen)}
        </div>
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
          {/* Auto option */}
          <button
            type="button"
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 16px',
              background: isAutoQuality ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#fff',
              fontSize: '14px',
              textAlign: 'left',
            }}
            onClick={() => handleQualityChange(-1)}
          >
            {autoLabel}
            {isAutoQuality && (
              <span style={{ float: 'right' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </span>
            )}
          </button>

          {/* Quality levels */}
          {levels.map((level, index) => (
            <button
              key={level.urlId ?? index}
              type="button"
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 16px',
                background:
                  !isAutoQuality && currentLevel === index
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '14px',
                textAlign: 'left',
              }}
              onClick={() => handleQualityChange(index)}
            >
              {level.height}p
              {!isAutoQuality && currentLevel === index && (
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
