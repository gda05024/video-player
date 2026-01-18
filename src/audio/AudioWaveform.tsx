'use client';

import React from 'react';
import { useWaveSurfer, type UseWaveSurferOptions } from './hooks/useWaveSurfer';

export interface AudioWaveformProps extends Omit<UseWaveSurferOptions, 'onReady' | 'onPlay' | 'onPause' | 'onFinish' | 'onSeeking' | 'onAudioprocess' | 'onError'> {
  className?: string;
  style?: React.CSSProperties;
  onReady?: (duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onFinish?: () => void;
  onSeeking?: (progress: number) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onError?: (error: Error) => void;
}

export interface AudioWaveformRef {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seekTo: (progress: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isReady: boolean;
}

export const AudioWaveform = React.forwardRef<AudioWaveformRef, AudioWaveformProps>(
  (
    {
      url,
      volume,
      playbackRate,
      waveColor,
      progressColor,
      cursorColor,
      cursorWidth,
      barWidth,
      barGap,
      barRadius,
      height,
      normalize,
      interact,
      hideScrollbar,
      autoCenter,
      className,
      style,
      onReady,
      onPlay,
      onPause,
      onFinish,
      onSeeking,
      onTimeUpdate,
      onError,
    },
    ref
  ) => {
    const {
      containerRef,
      isReady,
      isPlaying,
      currentTime,
      duration,
      play,
      pause,
      toggle,
      seekTo,
      setVolume,
      setPlaybackRate,
    } = useWaveSurfer({
      url,
      volume,
      playbackRate,
      waveColor,
      progressColor,
      cursorColor,
      cursorWidth,
      barWidth,
      barGap,
      barRadius,
      height,
      normalize,
      interact,
      hideScrollbar,
      autoCenter,
      onReady,
      onPlay,
      onPause,
      onFinish,
      onSeeking,
      onAudioprocess: onTimeUpdate,
      onError,
    });

    React.useImperativeHandle(ref, () => ({
      play,
      pause,
      toggle,
      seekTo,
      setVolume,
      setPlaybackRate,
      isPlaying,
      currentTime,
      duration,
      isReady,
    }));

    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          width: '100%',
          ...style,
        }}
      />
    );
  }
);

AudioWaveform.displayName = 'AudioWaveform';
