'use client';

import React, { forwardRef, useRef, useEffect, type ReactNode, useImperativeHandle } from 'react';
import { useInterpret, useSelector } from '@xstate/react';
import { playerMachine } from '../machine/playerMachine';
import { PlayerContext, type PlayerService } from '../machine/context';
import { VideoPlayerBody, type VideoPlayerBodyRef } from './VideoPlayerBody';
import type { Caption, CaptionTrack } from '../machine/types';
import { loadCaptionsFromUrl } from '../captions/utils/parseCaption';
import { currentCaptionTrackSelector, transcriptEnabledSelector, isPlaySelector, volumeSelector, mutedSelector } from '../machine/selectors';

export interface VideoPlayerProps {
  url: string;
  aspectRatio?: string;
  defaultSeekToSec?: number;
  captions?: Caption[];
  captionTracks?: CaptionTrack[];
  scripts?: Caption[];
  onPlayRateChange?: (playRate: number) => void;
  onVolumeChange?: (volume: number) => void;
  onQualityChange?: (quality: string) => void;
  onFullScreenChange?: (isFullScreen: boolean) => void;
  onForwardSeeking?: () => void;
  onBackwardSeeking?: () => void;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: unknown) => void;
  toolbar?: ReactNode;
  centerOverlay?: ReactNode;
  loadingOverlay?: ReactNode;
  bezelStatus?: ReactNode;
  screenActionArea?: ReactNode;
  captionRenderer?: ReactNode;
  transcriptPanel?: ReactNode;
  config?: React.ComponentProps<typeof VideoPlayerBody>['config'];
  className?: string;
  style?: React.CSSProperties;
}

export interface VideoPlayerRef {
  service: PlayerService;
  body: VideoPlayerBodyRef | null;
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setSpeed: (speed: number) => void;
  toggleFullscreen: () => Promise<void>;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  (
    {
      url,
      aspectRatio = '16 / 9',
      defaultSeekToSec,
      captions,
      captionTracks,
      scripts,
      onPlayRateChange,
      onVolumeChange,
      onQualityChange,
      onFullScreenChange,
      onForwardSeeking,
      onBackwardSeeking,
      onReady,
      onPlay,
      onPause,
      onEnded,
      onError,
      toolbar,
      centerOverlay,
      loadingOverlay,
      bezelStatus,
      screenActionArea,
      captionRenderer,
      transcriptPanel,
      config,
      className,
      style,
    },
    ref
  ) => {
    const bodyRef = useRef<VideoPlayerBodyRef>(null);

    const service = useInterpret(playerMachine, {
      actions: {
        onVolumeChange: (context, event) => {
          if (event.type === 'SET_VOLUME' || event.type === 'VOLUME_UP' || event.type === 'VOLUME_DOWN') {
            onVolumeChange?.(context.volume);
          }
          return context;
        },
        onSpeedChange: (context, event) => {
          if (event.type === 'SET_SPEED') {
            onPlayRateChange?.(context.speed);
          }
          return context;
        },
        onQualityChange: (context, event) => {
          if (event.type === 'SET_QUALITY' && context.levels[event.level]) {
            onQualityChange?.(`${context.levels[event.level].width}p`);
          }
          return context;
        },
        onFullScreenChange: (context, event) => {
          if (event.type === 'ENTER_FULLSCREEN') {
            onFullScreenChange?.(true);
          } else if (event.type === 'EXIT_FULLSCREEN') {
            onFullScreenChange?.(false);
          }
          return context;
        },
        onForwardSeeking: (context, event) => {
          if (event.type === 'FORWARD_SEEKING') {
            onForwardSeeking?.();
          }
          return context;
        },
        onBackwardSeeking: (context, event) => {
          if (event.type === 'BACKWARD_SEEKING') {
            onBackwardSeeking?.();
          }
          return context;
        },
      },
    });

    // Set initial captions and scripts
    React.useEffect(() => {
      if (captions && captions.length > 0) {
        service.send({ type: 'SET_CAPTIONS', captions });
      }
    }, [captions, service]);

    // Set caption tracks
    React.useEffect(() => {
      if (captionTracks && captionTracks.length > 0) {
        service.send({ type: 'SET_CAPTION_TRACKS', tracks: captionTracks });
      }
    }, [captionTracks, service]);

    // Load captions when track changes
    const currentTrack = useSelector(service, currentCaptionTrackSelector);
    React.useEffect(() => {
      if (currentTrack?.src) {
        loadCaptionsFromUrl(currentTrack.src)
          .then((loadedCaptions) => {
            service.send({ type: 'SET_CAPTIONS', captions: loadedCaptions });
            // Also set as scripts for transcript panel
            service.send({ type: 'SET_SCRIPTS', scripts: loadedCaptions });
          })
          .catch((error) => {
            console.error('[VideoPlayer] Failed to load captions:', error);
          });
      }
    }, [currentTrack?.src, service]);

    React.useEffect(() => {
      if (scripts && scripts.length > 0) {
        service.send({ type: 'SET_SCRIPTS', scripts });
      }
    }, [scripts, service]);

    // Handle default seek position
    const handleReady = React.useCallback(() => {
      if (defaultSeekToSec && defaultSeekToSec > 0) {
        const duration = bodyRef.current?.videoCore?.getDuration() ?? 0;
        if (duration > 0) {
          service.send({ type: 'SEEKING', seekTo: defaultSeekToSec / duration });
        }
      }
      onReady?.();
    }, [defaultSeekToSec, onReady, service]);

    useImperativeHandle(ref, () => ({
      service,
      body: bodyRef.current,
      seekTo: (seconds: number) => {
        const duration = bodyRef.current?.videoCore?.getDuration() ?? 0;
        if (duration > 0) {
          service.send({ type: 'SEEKING', seekTo: seconds / duration });
        }
      },
      play: () => service.send({ type: 'PLAY' }),
      pause: () => service.send({ type: 'STOP' }),
      togglePlay: () => {
        const isPlaying = service.getSnapshot().matches({ ready: { video: 'play' } });
        service.send({ type: isPlaying ? 'STOP' : 'PLAY' });
      },
      setVolume: (volume: number) => service.send({ type: 'SET_VOLUME', volume }),
      setSpeed: (speed: number) => service.send({ type: 'SET_SPEED', speed }),
      toggleFullscreen: async () => {
        await bodyRef.current?.fullscreenContainer?.toggleFullscreen();
      },
    }));

    const transcriptEnabled = useSelector(service, transcriptEnabledSelector);
    const isPlay = useSelector(service, isPlaySelector);
    const volume = useSelector(service, volumeSelector);
    const muted = useSelector(service, mutedSelector);

    const handleCloseTranscript = React.useCallback(() => {
      service.send({ type: 'SET_TRANSCRIPT_ENABLED', enabled: false });
    }, [service]);

    // Keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Ignore if typing in input/textarea
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }

        const hasModifier = e.metaKey || e.ctrlKey;

        switch (e.key) {
          case ' ': // Space - Play/Pause
            e.preventDefault();
            service.send({ type: isPlay ? 'STOP' : 'PLAY', showBezelStatus: true });
            break;
          case 'ArrowLeft': // ← - Seek backward 10s
            e.preventDefault();
            service.send({ type: 'BACKWARD_SEEKING', seekToSec: 10, showBezelStatus: true });
            break;
          case 'ArrowRight': // → - Seek forward 10s
            e.preventDefault();
            service.send({ type: 'FORWARD_SEEKING', seekToSec: 10, showBezelStatus: true });
            break;
          case 'ArrowUp': // ↑ - Volume up
            e.preventDefault();
            service.send({ type: 'SET_VOLUME', volume: Math.min(1, volume + 0.1) });
            break;
          case 'ArrowDown': // ↓ - Volume down
            e.preventDefault();
            service.send({ type: 'SET_VOLUME', volume: Math.max(0, volume - 0.1) });
            break;
          case 'm': // Cmd/Ctrl + M - Mute toggle
          case 'M':
            if (hasModifier) {
              e.preventDefault();
              service.send({ type: 'SET_MUTED', muted: !muted });
            }
            break;
          case 'f': // Cmd/Ctrl + F - Fullscreen toggle
          case 'F':
            if (hasModifier) {
              e.preventDefault();
              bodyRef.current?.fullscreenContainer?.toggleFullscreen();
            }
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [service, isPlay, volume, muted]);

    return (
      <PlayerContext.Provider value={service}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            height: '600px',
            ...style,
          }}
          className={className}
        >
          <div style={{ flex: '1 1 0%', minWidth: 0, height: '100%' }}>
            <VideoPlayerBody
              ref={bodyRef}
              url={url}
              aspectRatio={aspectRatio}
              config={config}
              onReady={handleReady}
              onPlay={onPlay}
              onPause={onPause}
              onEnded={onEnded}
              onError={onError}
              toolbar={toolbar}
              centerOverlay={centerOverlay}
              loadingOverlay={loadingOverlay}
              bezelStatus={bezelStatus}
              screenActionArea={screenActionArea}
              captionRenderer={captionRenderer}
            />
          </div>
          {transcriptEnabled && transcriptPanel && (
            <div
              style={{
                width: '300px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: '#1a1a1a',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseTranscript}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: '#fff',
                  padding: 0,
                  zIndex: 10,
                }}
                aria-label="Close transcript"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
              {/* Transcript Panel */}
              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                {transcriptPanel}
              </div>
            </div>
          )}
        </div>
      </PlayerContext.Provider>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
