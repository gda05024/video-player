import { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';

export interface WaveSurferOptions {
  waveColor?: string;
  progressColor?: string;
  cursorColor?: string;
  cursorWidth?: number;
  barWidth?: number;
  barGap?: number;
  barRadius?: number;
  height?: number;
  normalize?: boolean;
  interact?: boolean;
  hideScrollbar?: boolean;
  autoCenter?: boolean;
}

export interface UseWaveSurferOptions extends WaveSurferOptions {
  url?: string;
  volume?: number;
  playbackRate?: number;
  onReady?: (duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onFinish?: () => void;
  onSeeking?: (progress: number) => void;
  onAudioprocess?: (currentTime: number) => void;
  onError?: (error: Error) => void;
}

export interface UseWaveSurferReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  wavesurfer: WaveSurfer | null;
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seekTo: (progress: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
}

const DEFAULT_OPTIONS: WaveSurferOptions = {
  waveColor: 'rgba(255, 255, 255, 0.5)',
  progressColor: '#fff',
  cursorColor: '#fff',
  cursorWidth: 2,
  barWidth: 2,
  barGap: 1,
  barRadius: 2,
  height: 80,
  normalize: true,
  interact: true,
  hideScrollbar: true,
  autoCenter: true,
};

export function useWaveSurfer(options: UseWaveSurferOptions = {}): UseWaveSurferReturn {
  const {
    url,
    volume = 1,
    playbackRate = 1,
    onReady,
    onPlay,
    onPause,
    onFinish,
    onSeeking,
    onAudioprocess,
    onError,
    ...waveSurferOptions
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      ...DEFAULT_OPTIONS,
      ...waveSurferOptions,
    });

    wavesurferRef.current = ws;

    // Event handlers
    ws.on('ready', () => {
      setIsReady(true);
      setDuration(ws.getDuration());
      onReady?.(ws.getDuration());
    });

    ws.on('play', () => {
      setIsPlaying(true);
      onPlay?.();
    });

    ws.on('pause', () => {
      setIsPlaying(false);
      onPause?.();
    });

    ws.on('finish', () => {
      setIsPlaying(false);
      onFinish?.();
    });

    ws.on('seeking', (progress) => {
      onSeeking?.(progress);
    });

    ws.on('audioprocess', (time) => {
      setCurrentTime(time);
      onAudioprocess?.(time);
    });

    ws.on('error', (error) => {
      console.error('[WaveSurfer] Error:', error);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    });

    return () => {
      ws.destroy();
      wavesurferRef.current = null;
      setIsReady(false);
      setIsPlaying(false);
    };
  }, []);

  // Load audio URL
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws || !url) return;

    setIsReady(false);
    ws.load(url);
  }, [url]);

  // Update volume
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws || !isReady) return;
    ws.setVolume(volume);
  }, [volume, isReady]);

  // Update playback rate
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws || !isReady) return;
    ws.setPlaybackRate(playbackRate);
  }, [playbackRate, isReady]);

  const play = useCallback(() => {
    wavesurferRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    wavesurferRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    wavesurferRef.current?.playPause();
  }, []);

  const seekTo = useCallback((progress: number) => {
    wavesurferRef.current?.seekTo(progress);
    
  }, []);

  const setVolumeAction = useCallback((vol: number) => {
    wavesurferRef.current?.setVolume(vol);
  }, []);

  const setPlaybackRateAction = useCallback((rate: number) => {
    wavesurferRef.current?.setPlaybackRate(rate);
  }, []);

  return {
    containerRef,
    wavesurfer: wavesurferRef.current,
    isReady,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    toggle,
    seekTo,
    setVolume: setVolumeAction,
    setPlaybackRate: setPlaybackRateAction,
  };
}
