'use client';

import React, { forwardRef, useRef, useCallback, type ReactNode } from 'react';
import { useSelector } from '@xstate/react';
import { VideoCore, type VideoCoreRef } from './VideoCore';
import { FullscreenContainer, type FullscreenContainerRef } from './FullscreenContainer';
import { usePlayerContext } from '../machine/context';
import { isToolbarVisibleSelector, isLoadingSelector, isReadySelector } from '../machine/selectors';

export interface VideoPlayerBodyProps {
  url: string;
  aspectRatio?: string;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: unknown) => void;
  config?: React.ComponentProps<typeof VideoCore>['config'];
  toolbar?: ReactNode;
  centerOverlay?: ReactNode;
  loadingOverlay?: ReactNode;
  bezelStatus?: ReactNode;
  screenActionArea?: ReactNode;
  captionRenderer?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface VideoPlayerBodyRef {
  videoCore: VideoCoreRef | null;
  fullscreenContainer: FullscreenContainerRef | null;
}

export const VideoPlayerBody = forwardRef<VideoPlayerBodyRef, VideoPlayerBodyProps>(
  (
    {
      url,
      aspectRatio = '16 / 9',
      onReady,
      onPlay,
      onPause,
      onEnded,
      onError,
      config,
      toolbar,
      centerOverlay,
      loadingOverlay,
      bezelStatus,
      screenActionArea,
      captionRenderer,
      className,
      style,
    },
    ref
  ) => {
    const videoCoreRef = useRef<VideoCoreRef>(null);
    const fullscreenRef = useRef<FullscreenContainerRef>(null);

    const service = usePlayerContext();
    const isToolbarVisible = useSelector(service, isToolbarVisibleSelector);
    const isLoading = useSelector(service, isLoadingSelector);
    const isReady = useSelector(service, isReadySelector);
    const { send } = service;

    const handleMouseMove = useCallback(() => {
      if (isReady) {
        send({ type: 'SHOW_TOOLBAR' });
      }
    }, [isReady, send]);

    const handleMouseLeave = useCallback(() => {
      if (isReady) {
        send({ type: 'HIDE_TOOLBAR' });
      }
    }, [isReady, send]);

    React.useImperativeHandle(ref, () => ({
      videoCore: videoCoreRef.current,
      fullscreenContainer: fullscreenRef.current,
    }));

    return (
      <FullscreenContainer
        ref={fullscreenRef}
        className={className}
        style={{
          aspectRatio,
          ...style,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Video */}
          <VideoCore
            ref={videoCoreRef}
            url={url}
            config={config}
            onReady={onReady}
            onPlay={onPlay}
            onPause={onPause}
            onEnded={onEnded}
            onError={onError}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />

          {/* Captions */}
          {captionRenderer}

          {/* Screen Action Area (click to play/pause, double-click for fullscreen) */}
          {screenActionArea}

          {/* Bezel Status (play/pause/forward/backward feedback) */}
          {bezelStatus}

          {/* Loading Overlay */}
          {isLoading && loadingOverlay}

          {/* Center Overlay (fades with toolbar) */}
          {centerOverlay && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                transition: 'opacity 0.3s ease',
                opacity: isToolbarVisible ? 1 : 0,
                pointerEvents: isToolbarVisible ? 'auto' : 'none',
              }}
            >
              {centerOverlay}
            </div>
          )}

          {/* Toolbar */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              transition: 'opacity 0.3s ease',
              opacity: isToolbarVisible ? 1 : 0,
            }}
            onClick={() => {
              // Show toolbar when clicking in the toolbar area (even when hidden)
              if (!isToolbarVisible) {
                send({ type: 'SHOW_TOOLBAR' });
              }
            }}
          >
            {toolbar}
          </div>
        </div>
      </FullscreenContainer>
    );
  }
);

VideoPlayerBody.displayName = 'VideoPlayerBody';
