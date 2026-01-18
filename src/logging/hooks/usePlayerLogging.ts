import { useEffect, useRef, useCallback } from 'react';
import { useSelector } from '@xstate/react';
import { usePlayerContext } from '../../machine/context';
import {
  isPlaySelector,
  isReadySelector,
  playedSecondsSelector,
  durationSelector,
  volumeSelector,
  speedSelector,
  currentLevelSelector,
  isFullscreenSelector,
} from '../../machine/selectors';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface PlayerLogEvent {
  event: string;
  level: LogLevel;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface LoggerAdapter {
  log: (event: PlayerLogEvent) => void;
}

export interface DatadogLoggerConfig {
  clientToken: string;
  site?: string;
  service?: string;
  env?: string;
  version?: string;
}

export interface UsePlayerLoggingOptions {
  enabled?: boolean;
  logger?: LoggerAdapter;
  datadogConfig?: DatadogLoggerConfig;
  videoId?: string;
  userId?: string;
  additionalContext?: Record<string, unknown>;
  logPlaybackEvents?: boolean;
  logQualityChanges?: boolean;
  logVolumeChanges?: boolean;
  logErrors?: boolean;
  heartbeatInterval?: number;
}

/**
 * Create a console logger adapter
 */
export function createConsoleLogger(): LoggerAdapter {
  return {
    log: (event: PlayerLogEvent) => {
      const logFn = event.level === 'error' ? console.error :
                    event.level === 'warn' ? console.warn :
                    event.level === 'debug' ? console.debug : console.log;
      logFn(`[PlayerLog] ${event.event}`, event.data);
    },
  };
}

/**
 * Create a Datadog logger adapter
 * Note: Requires @datadog/browser-logs to be installed and initialized separately
 */
export function createDatadogLogger(config: DatadogLoggerConfig): LoggerAdapter {
  // This is a placeholder - actual implementation requires @datadog/browser-logs
  return {
    log: (event: PlayerLogEvent) => {
      // Check if datadogLogs is available globally
      const datadogLogs = (window as Window & { DD_LOGS?: { logger: { log: (message: string, context: unknown, level: string) => void } } }).DD_LOGS;
      if (datadogLogs?.logger) {
        datadogLogs.logger.log(event.event, event.data, event.level);
      } else {
        console.warn('[PlayerLogging] Datadog logger not initialized');
      }
    },
  };
}

export function usePlayerLogging(options: UsePlayerLoggingOptions = {}) {
  const {
    enabled = true,
    logger = createConsoleLogger(),
    videoId,
    userId,
    additionalContext = {},
    logPlaybackEvents = true,
    logQualityChanges = true,
    logVolumeChanges = true,
    logErrors = true,
    heartbeatInterval = 30000,
  } = options;

  const service = usePlayerContext();

  const isPlay = useSelector(service, isPlaySelector);
  const isReady = useSelector(service, isReadySelector);
  const playedSeconds = useSelector(service, playedSecondsSelector);
  const duration = useSelector(service, durationSelector);
  const volume = useSelector(service, volumeSelector);
  const speed = useSelector(service, speedSelector);
  const currentLevel = useSelector(service, currentLevelSelector);
  const isFullscreen = useSelector(service, isFullscreenSelector);

  const prevIsPlayRef = useRef(isPlay);
  const prevVolumeRef = useRef(volume);
  const prevLevelRef = useRef(currentLevel);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const log = useCallback(
    (event: string, level: LogLevel = 'info', data?: Record<string, unknown>) => {
      if (!enabled) return;

      logger.log({
        event,
        level,
        timestamp: Date.now(),
        data: {
          videoId,
          userId,
          playedSeconds,
          duration,
          volume,
          speed,
          currentLevel,
          isFullscreen,
          ...additionalContext,
          ...data,
        },
      });
    },
    [
      enabled,
      logger,
      videoId,
      userId,
      playedSeconds,
      duration,
      volume,
      speed,
      currentLevel,
      isFullscreen,
      additionalContext,
    ]
  );

  // Log ready event
  useEffect(() => {
    if (isReady) {
      log('player_ready', 'info', { duration });
    }
  }, [isReady, duration, log]);

  // Log play/pause events
  useEffect(() => {
    if (!logPlaybackEvents) return;

    if (isPlay !== prevIsPlayRef.current) {
      prevIsPlayRef.current = isPlay;
      log(isPlay ? 'playback_started' : 'playback_paused', 'info');
    }
  }, [isPlay, logPlaybackEvents, log]);

  // Log volume changes
  useEffect(() => {
    if (!logVolumeChanges) return;

    if (volume !== prevVolumeRef.current) {
      prevVolumeRef.current = volume;
      log('volume_changed', 'info', { volume });
    }
  }, [volume, logVolumeChanges, log]);

  // Log quality changes
  useEffect(() => {
    if (!logQualityChanges) return;

    if (currentLevel !== prevLevelRef.current) {
      prevLevelRef.current = currentLevel;
      log('quality_changed', 'info', { level: currentLevel });
    }
  }, [currentLevel, logQualityChanges, log]);

  // Heartbeat logging
  useEffect(() => {
    if (!enabled || !isPlay || heartbeatInterval <= 0) {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
      return;
    }

    heartbeatTimerRef.current = setInterval(() => {
      log('playback_heartbeat', 'debug');
    }, heartbeatInterval);

    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    };
  }, [enabled, isPlay, heartbeatInterval, log]);

  // Log error function to be used externally
  const logError = useCallback(
    (error: Error, context?: Record<string, unknown>) => {
      if (!logErrors) return;
      log('player_error', 'error', {
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack,
        ...context,
      });
    },
    [logErrors, log]
  );

  return {
    log,
    logError,
  };
}
