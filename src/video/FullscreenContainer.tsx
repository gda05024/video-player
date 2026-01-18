'use client';

import React, { forwardRef, useCallback, useEffect, useRef, useImperativeHandle, type ReactNode } from 'react';
import screenfull from 'screenfull';
import { useSelector } from '@xstate/react';
import { usePlayerContext } from '../machine/context';
import { isFullscreenSelector } from '../machine/selectors';

export interface FullscreenContainerProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface FullscreenContainerRef {
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
  isFullscreen: () => boolean;
}

export const FullscreenContainer = forwardRef<FullscreenContainerRef, FullscreenContainerProps>(
  ({ children, className, style }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const service = usePlayerContext();
    const { send } = service;
    const isFullscreen = useSelector(service, isFullscreenSelector);

    const enterFullscreen = useCallback(async () => {
      if (screenfull.isEnabled && containerRef.current) {
        await screenfull.request(containerRef.current);
        send({ type: 'ENTER_FULLSCREEN' });
      }
    }, [send]);

    const exitFullscreen = useCallback(async () => {
      if (screenfull.isEnabled && screenfull.isFullscreen) {
        await screenfull.exit();
        send({ type: 'EXIT_FULLSCREEN' });
      }
    }, [send]);

    const toggleFullscreen = useCallback(async () => {
      if (screenfull.isEnabled) {
        if (screenfull.isFullscreen) {
          await exitFullscreen();
        } else {
          await enterFullscreen();
        }
      }
    }, [enterFullscreen, exitFullscreen]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      enterFullscreen,
      exitFullscreen,
      toggleFullscreen,
      isFullscreen: () => screenfull.isEnabled && screenfull.isFullscreen,
    }));

    // Sync fullscreen state changes from external sources (e.g., Esc key)
    useEffect(() => {
      if (!screenfull.isEnabled) return;

      const handleChange = () => {
        if (screenfull.isFullscreen) {
          send({ type: 'ENTER_FULLSCREEN' });
        } else {
          send({ type: 'EXIT_FULLSCREEN' });
        }
      };

      screenfull.on('change', handleChange);
      return () => {
        screenfull.off('change', handleChange);
      };
    }, [send]);

    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#000',
          ...style,
        }}
        data-fullscreen={isFullscreen}
      >
        {children}
      </div>
    );
  }
);

FullscreenContainer.displayName = 'FullscreenContainer';
