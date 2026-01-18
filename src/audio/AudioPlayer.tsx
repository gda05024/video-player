'use client';

import React, { useRef, useState, useCallback } from 'react';
import { AudioWaveform, type AudioWaveformRef, type AudioWaveformProps } from './AudioWaveform';
import { formatTime } from '../utils/timeFormat';

export interface AudioPlayerProps extends Omit<AudioWaveformProps, 'onTimeUpdate'> {
  showControls?: boolean;
  showTime?: boolean;
  showVolumeControl?: boolean;
  showSpeedControl?: boolean;
  playIcon?: React.ReactNode;
  pauseIcon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  controlsClassName?: string;
  controlsStyle?: React.CSSProperties;
}

export interface AudioPlayerRef extends AudioWaveformRef {}

export const AudioPlayer = React.forwardRef<AudioPlayerRef, AudioPlayerProps>(
  (
    {
      url,
      volume: initialVolume = 1,
      playbackRate: initialPlaybackRate = 1,
      showControls = true,
      showTime = true,
      showVolumeControl = true,
      showSpeedControl = true,
      playIcon,
      pauseIcon,
      className,
      style,
      controlsClassName,
      controlsStyle,
      onReady,
      onPlay,
      onPause,
      onFinish,
      ...waveformProps
    },
    ref
  ) => {
    const waveformRef = useRef<AudioWaveformRef>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(initialVolume);
    const [playbackRate, setPlaybackRate] = useState(initialPlaybackRate);
    const [isReady, setIsReady] = useState(false);

    const handleReady = useCallback(
      (dur: number) => {
        setDuration(dur);
        setIsReady(true);
        onReady?.(dur);
      },
      [onReady]
    );

    const handlePlay = useCallback(() => {
      setIsPlaying(true);
      onPlay?.();
    }, [onPlay]);

    const handlePause = useCallback(() => {
      setIsPlaying(false);
      onPause?.();
    }, [onPause]);

    const handleFinish = useCallback(() => {
      setIsPlaying(false);
      onFinish?.();
    }, [onFinish]);

    const handleTimeUpdate = useCallback((time: number) => {
      setCurrentTime(time);
    }, []);

    const handleToggle = useCallback(() => {
      waveformRef.current?.toggle();
    }, []);

    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      waveformRef.current?.setVolume(newVolume);
    }, []);

    const handleSpeedChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
      const newRate = parseFloat(e.target.value);
      setPlaybackRate(newRate);
      waveformRef.current?.setPlaybackRate(newRate);
    }, []);

    React.useImperativeHandle(ref, () => ({
      play: () => waveformRef.current?.play(),
      pause: () => waveformRef.current?.pause(),
      toggle: () => waveformRef.current?.toggle(),
      seekTo: (progress: number) => waveformRef.current?.seekTo(progress),
      setVolume: (vol: number) => {
        setVolume(vol);
        waveformRef.current?.setVolume(vol);
      },
      setPlaybackRate: (rate: number) => {
        setPlaybackRate(rate);
        waveformRef.current?.setPlaybackRate(rate);
      },
      isPlaying,
      currentTime,
      duration,
      isReady,
    }));

    const defaultPlayIcon = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    );

    const defaultPauseIcon = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
      </svg>
    );

    return (
      <div
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '16px',
          backgroundColor: '#1a1a1a',
          borderRadius: '8px',
          ...style,
        }}
      >
        {/* Waveform */}
        <AudioWaveform
          ref={waveformRef}
          url={url}
          volume={volume}
          playbackRate={playbackRate}
          onReady={handleReady}
          onPlay={handlePlay}
          onPause={handlePause}
          onFinish={handleFinish}
          onTimeUpdate={handleTimeUpdate}
          {...waveformProps}
        />

        {/* Controls */}
        {showControls && (
          <div
            className={controlsClassName}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              ...controlsStyle,
            }}
          >
            {/* Play/Pause Button */}
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
                opacity: isReady ? 1 : 0.5,
              }}
              onClick={handleToggle}
              disabled={!isReady}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (pauseIcon ?? defaultPauseIcon) : (playIcon ?? defaultPlayIcon)}
            </button>

            {/* Time Display */}
            {showTime && (
              <span style={{ color: '#fff', fontSize: '14px', minWidth: '100px' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            )}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Volume Control */}
            {showVolumeControl && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  style={{ width: '80px', cursor: 'pointer' }}
                />
              </div>
            )}

            {/* Speed Control */}
            {showSpeedControl && (
              <select
                value={playbackRate}
                onChange={handleSpeedChange}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                <option value="0.5" style={{ background: '#1a1a1a' }}>0.5x</option>
                <option value="0.75" style={{ background: '#1a1a1a' }}>0.75x</option>
                <option value="1" style={{ background: '#1a1a1a' }}>1x</option>
                <option value="1.25" style={{ background: '#1a1a1a' }}>1.25x</option>
                <option value="1.5" style={{ background: '#1a1a1a' }}>1.5x</option>
                <option value="2" style={{ background: '#1a1a1a' }}>2x</option>
              </select>
            )}
          </div>
        )}
      </div>
    );
  }
);

AudioPlayer.displayName = 'AudioPlayer';
