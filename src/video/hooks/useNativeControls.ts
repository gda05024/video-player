import { useEffect, useRef, useCallback } from 'react';
import { isIOS, isSafari } from '../../utils/deviceDetection';

export interface UseNativeControlsOptions {
  enabled?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onSeeking?: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export interface UseNativeControlsReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  isNativeControlsActive: boolean;
}

/**
 * Hook to handle native video controls on iOS Safari
 * iOS Safari requires special handling as it uses native video controls in fullscreen
 */
export function useNativeControls(
  options: UseNativeControlsOptions = {}
): UseNativeControlsReturn {
  const {
    enabled = true,
    onPlay,
    onPause,
    onSeeking,
    onVolumeChange,
    onFullscreenChange,
  } = options;

  const videoRef = useRef<HTMLVideoElement>(null);
  const isNativeControlsActive = enabled && isIOS() && isSafari();

  const handlePlay = useCallback(() => {
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    onPause?.();
  }, [onPause]);

  const handleSeeking = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      onSeeking?.(video.currentTime);
    }
  }, [onSeeking]);

  const handleVolumeChange = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      onVolumeChange?.(video.muted ? 0 : video.volume);
    }
  }, [onVolumeChange]);

  const handleFullscreenChange = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check for webkit fullscreen (iOS Safari)
    const webkitVideo = video as HTMLVideoElement & {
      webkitDisplayingFullscreen?: boolean;
    };
    const isFullscreen = webkitVideo.webkitDisplayingFullscreen ?? false;
    onFullscreenChange?.(isFullscreen);
  }, [onFullscreenChange]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isNativeControlsActive) return;

    // Add event listeners for native control interactions
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('volumechange', handleVolumeChange);

    // iOS-specific fullscreen events
    video.addEventListener('webkitbeginfullscreen', handleFullscreenChange);
    video.addEventListener('webkitendfullscreen', handleFullscreenChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('webkitbeginfullscreen', handleFullscreenChange);
      video.removeEventListener('webkitendfullscreen', handleFullscreenChange);
    };
  }, [
    isNativeControlsActive,
    handlePlay,
    handlePause,
    handleSeeking,
    handleVolumeChange,
    handleFullscreenChange,
  ]);

  return {
    videoRef,
    isNativeControlsActive,
  };
}
