import { useEffect, useCallback, useRef } from 'react';
import { useSelector } from '@xstate/react';
import { usePlayerContext } from '../../machine/context';
import { isPlaySelector, volumeSelector } from '../../machine/selectors';

export interface KeyboardShortcutsConfig {
  playPause?: string;
  forward?: string;
  backward?: string;
  volumeUp?: string;
  volumeDown?: string;
  mute?: string;
  fullscreen?: string;
}

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  seekSeconds?: number;
  volumeStep?: number;
  shortcuts?: KeyboardShortcutsConfig;
  containerRef?: React.RefObject<HTMLElement>;
  onFullscreen?: () => void;
}

const DEFAULT_SHORTCUTS: KeyboardShortcutsConfig = {
  playPause: ' ', // Space
  forward: 'ArrowRight',
  backward: 'ArrowLeft',
  volumeUp: 'ArrowUp',
  volumeDown: 'ArrowDown',
  mute: 'm',
  fullscreen: 'f',
};

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const {
    enabled = true,
    seekSeconds = 10,
    volumeStep = 0.1,
    shortcuts = DEFAULT_SHORTCUTS,
    containerRef,
    onFullscreen,
  } = options;

  const service = usePlayerContext();
  const { send } = service;
  const isPlay = useSelector(service, isPlaySelector);
  const volume = useSelector(service, volumeSelector);

  const isPlayRef = useRef(isPlay);
  const volumeRef = useRef(volume);

  // Keep refs in sync
  useEffect(() => {
    isPlayRef.current = isPlay;
  }, [isPlay]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const mergedShortcuts = { ...DEFAULT_SHORTCUTS, ...shortcuts };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      // Check if event is within container (if specified)
      if (containerRef?.current && !containerRef.current.contains(target)) {
        return;
      }

      const key = event.key;

      // Play/Pause
      if (key === mergedShortcuts.playPause) {
        event.preventDefault();
        send({ type: isPlayRef.current ? 'STOP' : 'PLAY', showBezelStatus: true });
        return;
      }

      // Forward
      if (key === mergedShortcuts.forward) {
        event.preventDefault();
        send({ type: 'FORWARD_SEEKING', seekToSec: seekSeconds, showBezelStatus: true });
        return;
      }

      // Backward
      if (key === mergedShortcuts.backward) {
        event.preventDefault();
        send({ type: 'BACKWARD_SEEKING', seekToSec: seekSeconds, showBezelStatus: true });
        return;
      }

      // Volume Up
      if (key === mergedShortcuts.volumeUp) {
        event.preventDefault();
        send({ type: 'VOLUME_UP', volume: volumeStep, showBezelStatus: true });
        return;
      }

      // Volume Down
      if (key === mergedShortcuts.volumeDown) {
        event.preventDefault();
        send({ type: 'VOLUME_DOWN', volume: volumeStep, showBezelStatus: true });
        return;
      }

      // Mute toggle
      if (key.toLowerCase() === mergedShortcuts.mute?.toLowerCase()) {
        event.preventDefault();
        const currentMuted = volumeRef.current === 0;
        send({ type: 'SET_MUTED', muted: !currentMuted });
        return;
      }

      // Fullscreen
      if (key.toLowerCase() === mergedShortcuts.fullscreen?.toLowerCase()) {
        event.preventDefault();
        onFullscreen?.();
        return;
      }
    },
    [send, seekSeconds, volumeStep, mergedShortcuts, containerRef, onFullscreen]
  );

  useEffect(() => {
    if (!enabled) return;

    const target = containerRef?.current ?? document;
    target.addEventListener('keydown', handleKeyDown as EventListener);

    return () => {
      target.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [enabled, handleKeyDown, containerRef]);
}
