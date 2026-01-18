'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useSelector } from '@xstate/react';
import { usePlayerContext } from '../../machine/context';
import {
  speedSelector,
  currentLevelSelector,
  levelsSelector,
  isAutoQualitySelector,
  captionsEnabledSelector,
  transcriptEnabledSelector,
  captionTracksSelector,
  currentCaptionTrackIdSelector,
} from '../../machine/selectors';

export interface SettingsMenuProps {
  className?: string;
  style?: React.CSSProperties;
  menuStyle?: React.CSSProperties;
  icon?: React.ReactNode;
  speeds?: number[];
  autoLabel?: string;
  captionsLabel?: string;
  transcriptLabel?: string;
  speedLabel?: string;
  qualityLabel?: string;
  onLabel?: string;
  offLabel?: string;
}

type MenuView = 'main' | 'speed' | 'quality' | 'captions';

const DEFAULT_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function SettingsMenu({
  className,
  style,
  menuStyle,
  icon,
  speeds = DEFAULT_SPEEDS,
  autoLabel = 'Auto',
  captionsLabel = 'Captions',
  transcriptLabel = 'Transcript',
  speedLabel = 'Speed',
  qualityLabel = 'Quality',
  onLabel = 'On',
  offLabel = 'Off',
}: SettingsMenuProps) {
  const service = usePlayerContext();
  const speed = useSelector(service, speedSelector);
  const currentLevel = useSelector(service, currentLevelSelector);
  const levels = useSelector(service, levelsSelector);
  const isAutoQuality = useSelector(service, isAutoQualitySelector);
  const captionsEnabled = useSelector(service, captionsEnabledSelector);
  const transcriptEnabled = useSelector(service, transcriptEnabledSelector);
  const captionTracks = useSelector(service, captionTracksSelector);
  const currentCaptionTrackId = useSelector(service, currentCaptionTrackIdSelector);
  const { send } = service;

  const [isOpen, setIsOpen] = useState(false);
  const [menuView, setMenuView] = useState<MenuView>('main');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setMenuView('main');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
    setMenuView('main');
  }, []);

  const handleSpeedChange = useCallback(
    (newSpeed: number) => {
      send({ type: 'SET_SPEED', speed: newSpeed });
      setMenuView('main');
    },
    [send]
  );

  const handleQualityChange = useCallback(
    (level: number) => {
      if (level === -1) {
        send({ type: 'SET_AUTO_QUALITY' });
      } else {
        send({ type: 'SET_QUALITY', level });
      }
      setMenuView('main');
    },
    [send]
  );

  const handleToggleTranscript = useCallback(() => {
    send({ type: 'TOGGLE_TRANSCRIPT' });
  }, [send]);

  const formatSpeed = (s: number) => (s === 1 ? 'Normal' : `${s}x`);

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

  const checkIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );

  const chevronRightIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  );

  const chevronLeftIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  );

  const menuItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#fff',
    fontSize: '14px',
    textAlign: 'left',
  };

  const getCurrentCaptionLabel = () => {
    if (!captionsEnabled || !currentCaptionTrackId) {
      return offLabel;
    }
    const track = captionTracks.find((t) => t.id === currentCaptionTrackId);
    return track?.label ?? offLabel;
  };

  const renderMainMenu = () => (
    <>
      {/* Captions Submenu */}
      <button
        type="button"
        style={menuItemStyle}
        onClick={() => setMenuView('captions')}
      >
        <span>{captionsLabel}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#999' }}>{getCurrentCaptionLabel()}</span>
          {chevronRightIcon}
        </span>
      </button>

      {/* Transcript Toggle */}
      <button
        type="button"
        style={menuItemStyle}
        onClick={handleToggleTranscript}
      >
        <span>{transcriptLabel}</span>
        <span style={{ color: transcriptEnabled ? '#4CAF50' : '#999' }}>
          {transcriptEnabled ? onLabel : offLabel}
        </span>
      </button>

      {/* Speed Submenu */}
      <button
        type="button"
        style={menuItemStyle}
        onClick={() => setMenuView('speed')}
      >
        <span>{speedLabel}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#999' }}>{formatSpeed(speed)}</span>
          {chevronRightIcon}
        </span>
      </button>

      {/* Quality Submenu (only if levels available) */}
      {levels.length > 0 && (
        <button
          type="button"
          style={menuItemStyle}
          onClick={() => setMenuView('quality')}
        >
          <span>{qualityLabel}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#999' }}>{getCurrentQualityLabel()}</span>
            {chevronRightIcon}
          </span>
        </button>
      )}
    </>
  );

  const renderSpeedMenu = () => (
    <>
      <button
        type="button"
        style={{ ...menuItemStyle, borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        onClick={() => setMenuView('main')}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {chevronLeftIcon}
          {speedLabel}
        </span>
      </button>
      {speeds.map((s) => (
        <button
          key={s}
          type="button"
          style={{
            ...menuItemStyle,
            background: s === speed ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          }}
          onClick={() => handleSpeedChange(s)}
        >
          <span>{formatSpeed(s)}</span>
          {s === speed && <span style={{ marginLeft: 'auto' }}>{checkIcon}</span>}
        </button>
      ))}
    </>
  );

  const renderQualityMenu = () => (
    <>
      <button
        type="button"
        style={{ ...menuItemStyle, borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        onClick={() => setMenuView('main')}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {chevronLeftIcon}
          {qualityLabel}
        </span>
      </button>
      {/* Auto option */}
      <button
        type="button"
        style={{
          ...menuItemStyle,
          background: isAutoQuality ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        }}
        onClick={() => handleQualityChange(-1)}
      >
        <span>{autoLabel}</span>
        {isAutoQuality && <span style={{ marginLeft: 'auto' }}>{checkIcon}</span>}
      </button>
      {/* Quality levels */}
      {levels.map((level, index) => (
        <button
          key={level.urlId ?? index}
          type="button"
          style={{
            ...menuItemStyle,
            background: !isAutoQuality && currentLevel === index
              ? 'rgba(255, 255, 255, 0.1)'
              : 'transparent',
          }}
          onClick={() => handleQualityChange(index)}
        >
          <span>{level.height}p</span>
          {!isAutoQuality && currentLevel === index && (
            <span style={{ marginLeft: 'auto' }}>{checkIcon}</span>
          )}
        </button>
      ))}
    </>
  );

  const handleSelectCaptionTrack = useCallback(
    (trackId: string | null) => {
      send({ type: 'SELECT_CAPTION_TRACK', trackId });
      setMenuView('main');
    },
    [send]
  );

  const renderCaptionsMenu = () => (
    <>
      <button
        type="button"
        style={{ ...menuItemStyle, borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        onClick={() => setMenuView('main')}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {chevronLeftIcon}
          {captionsLabel}
        </span>
      </button>
      {/* Off option */}
      <button
        type="button"
        style={{
          ...menuItemStyle,
          background: !captionsEnabled || !currentCaptionTrackId ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        }}
        onClick={() => handleSelectCaptionTrack(null)}
      >
        <span>{offLabel}</span>
        {(!captionsEnabled || !currentCaptionTrackId) && <span style={{ marginLeft: 'auto' }}>{checkIcon}</span>}
      </button>
      {/* Caption tracks */}
      {captionTracks.map((track) => (
        <button
          key={track.id}
          type="button"
          style={{
            ...menuItemStyle,
            background: captionsEnabled && currentCaptionTrackId === track.id
              ? 'rgba(255, 255, 255, 0.1)'
              : 'transparent',
          }}
          onClick={() => handleSelectCaptionTrack(track.id)}
        >
          <span>{track.label}</span>
          {captionsEnabled && currentCaptionTrackId === track.id && (
            <span style={{ marginLeft: 'auto' }}>{checkIcon}</span>
          )}
        </button>
      ))}
    </>
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
      <button
        type="button"
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
        }}
        onClick={handleToggle}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        aria-label="Settings"
      >
        {icon ?? defaultIcon}
      </button>

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
            minWidth: '200px',
            maxHeight: '300px',
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            zIndex: 100,
            ...menuStyle,
          }}
        >
          {menuView === 'main' && renderMainMenu()}
          {menuView === 'speed' && renderSpeedMenu()}
          {menuView === 'captions' && renderCaptionsMenu()}
          {menuView === 'quality' && renderQualityMenu()}
        </div>
      )}
    </div>
  );
}
