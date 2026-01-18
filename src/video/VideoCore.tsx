'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useImperativeHandle,
  type MutableRefObject,
} from 'react';
import ReactPlayer from 'react-player/lazy';
import type { OnProgressProps } from 'react-player/base';
import { useSelector } from '@xstate/react';
import type Hls from 'hls.js';
import { usePlayerContext } from '../machine/context';
import {
  isPlaySelector,
  mutedSelector,
  volumeSelector,
  speedSelector,
  seekNumberSelector,
} from '../machine/selectors';

export interface VideoCoreProps {
  url: string;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: unknown) => void;
  onBuffer?: () => void;
  onBufferEnd?: () => void;
  loop?: boolean;
  playsinline?: boolean;
  pip?: boolean;
  config?: ReactPlayer['props']['config'];
  style?: React.CSSProperties;
  width?: string | number;
  height?: string | number;
}

export interface VideoCoreRef {
  getInternalPlayer: () => ReactPlayer | null;
  seekTo: (amount: number, type?: 'seconds' | 'fraction') => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

const DEFAULT_VOLUME = 1;

export const VideoCore = forwardRef<VideoCoreRef, VideoCoreProps>(
  (
    {
      url,
      onReady,
      onPlay,
      onPause,
      onEnded,
      onError,
      onBuffer,
      onBufferEnd,
      loop = false,
      playsinline = true,
      pip = false,
      config,
      style,
      width = '100%',
      height = '100%',
    },
    ref
  ) => {
    const service = usePlayerContext();
    const { send } = service;

    const reactPlayerRef = useRef<ReactPlayer>(null);

    const isPlay = useSelector(service, isPlaySelector);
    const muted = useSelector(service, mutedSelector);
    const volume = useSelector(service, volumeSelector);
    const speed = useSelector(service, speedSelector);
    const seekNumber = useSelector(service, seekNumberSelector);

    useImperativeHandle(ref, () => ({
      getInternalPlayer: () => reactPlayerRef.current,
      seekTo: (amount, type = 'fraction') => {
        reactPlayerRef.current?.seekTo(amount, type);
      },
      getCurrentTime: () => reactPlayerRef.current?.getCurrentTime() ?? 0,
      getDuration: () => reactPlayerRef.current?.getDuration() ?? 0,
    }));

    // Handle seeking from state machine
    const lastSeekNumberRef = useRef<number | null>(null);
    useLayoutEffect(() => {
      // Only seek if seekNumber changed and is not null
      if (seekNumber !== null && seekNumber !== lastSeekNumberRef.current && reactPlayerRef.current) {
        lastSeekNumberRef.current = seekNumber;
        reactPlayerRef.current.seekTo(seekNumber, 'fraction');
        // Delay SEEKED to ensure seek completes
        requestAnimationFrame(() => {
          send({ type: 'SEEKED' });
          lastSeekNumberRef.current = null;
        });
      }
    }, [seekNumber, send]);

    const handleReady = useCallback(
      (player: ReactPlayer) => {
        const hls = player.getInternalPlayer('hls') as Hls | undefined;
        const duration = player.getDuration();

        send({
          type: 'READY',
          readyContext: {
            currentLevel: hls?.currentLevel ?? -1,
            levels: hls?.levels ?? [],
            duration: duration || 0,
            volume: DEFAULT_VOLUME,
            muted: false,
          },
        });

        onReady?.();
      },
      [send, onReady]
    );

    const handleProgress = useCallback(
      (state: OnProgressProps) => {
        send({
          type: 'PROGRESS',
          progressContext: state,
        });
      },
      [send]
    );

    const handlePlay = useCallback(() => {
      send({ type: 'PLAY' });
      onPlay?.();
    }, [send, onPlay]);

    const handlePause = useCallback(() => {
      send({ type: 'STOP' });
      onPause?.();
    }, [send, onPause]);

    const handleEnded = useCallback(() => {
      send({ type: 'STOP' });
      onEnded?.();
    }, [send, onEnded]);

    const handleBuffer = useCallback(() => {
      send({ type: 'BUFFERING' });
      onBuffer?.();
    }, [send, onBuffer]);

    const handleBufferEnd = useCallback(() => {
      send({ type: 'BUFFER_END' });
      onBufferEnd?.();
    }, [send, onBufferEnd]);

    const handleError = useCallback(
      (error: unknown) => {
        console.error('[VideoCore] Error:', error);
        onError?.(error);
      },
      [onError]
    );

    return (
      <ReactPlayer
        ref={reactPlayerRef}
        url={url}
        playing={isPlay}
        muted={muted}
        volume={volume}
        playbackRate={speed}
        loop={loop}
        playsinline={playsinline}
        pip={pip}
        width={width}
        height={height}
        style={style}
        config={config}
        onReady={handleReady}
        onProgress={handleProgress}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onBuffer={handleBuffer}
        onBufferEnd={handleBufferEnd}
        onError={handleError}
        progressInterval={100}
      />
    );
  }
);

VideoCore.displayName = 'VideoCore';
