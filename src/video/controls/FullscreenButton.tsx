'use client';

import React, { useCallback, useRef } from 'react';
import { useSelector } from '@xstate/react';
import screenfull from 'screenfull';
import { usePlayerContext } from '../../machine/context';
import { isFullscreenSelector } from '../../machine/selectors';

export interface FullscreenButtonProps {
  enterFullscreenIcon?: React.ReactNode;
  exitFullscreenIcon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  containerRef?: React.RefObject<HTMLElement>;
  onClick?: () => void;
}

export function FullscreenButton({
  enterFullscreenIcon,
  exitFullscreenIcon,
  className,
  style,
  containerRef,
  onClick,
}: FullscreenButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const service = usePlayerContext();
  const isFullscreen = useSelector(service, isFullscreenSelector);
  const { send } = service;

  const handleClick = useCallback(async () => {
    if (!screenfull.isEnabled) return;

    try {
      if (isFullscreen) {
        await screenfull.exit();
        send({ type: 'EXIT_FULLSCREEN' });
      } else {
        // Priority: containerRef > closest [data-fullscreen] > documentElement
        let element: Element | null = containerRef?.current ?? null;
        if (!element && buttonRef.current) {
          element = buttonRef.current.closest('[data-fullscreen]');
        }
        element = element ?? document.documentElement;
        await screenfull.request(element);
        send({ type: 'ENTER_FULLSCREEN' });
      }
      onClick?.();
    } catch (error) {
      console.error('[FullscreenButton] Error toggling fullscreen:', error);
    }
  }, [isFullscreen, containerRef, send, onClick]);

  // Google Material Icons
  const defaultEnterFullscreenIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
    </svg>
  );

  const defaultExitFullscreenIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
    </svg>
  );

  if (!screenfull.isEnabled) {
    return null;
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      className={className}
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
        ...style,
      }}
      onClick={handleClick}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {isFullscreen
        ? (exitFullscreenIcon ?? defaultExitFullscreenIcon)
        : (enterFullscreenIcon ?? defaultEnterFullscreenIcon)}
    </button>
  );
}
