import type { StateFrom } from 'xstate';
import type { playerMachine } from './playerMachine';

export type SelectState = StateFrom<typeof playerMachine>;

// State matching selectors
export const isPlaySelector = (state: SelectState) =>
  state.matches({ ready: { video: 'play' } });

export const isStopSelector = (state: SelectState) =>
  state.matches({ ready: { video: 'stop' } });

export const isPendingSelector = (state: SelectState) =>
  state.matches({ ready: { video: 'pending' } });

export const isReadySelector = (state: SelectState) => state.matches('ready');

export const isWaitReadySelector = (state: SelectState) => state.matches('wait-ready');

export const isLoadingSelector = (state: SelectState) =>
  state.matches({ ready: { loadingState: 'loading' } });

export const isToolbarVisibleSelector = (state: SelectState) =>
  state.matches('wait-ready') || state.matches({ ready: { showToolbar: 'visible' } });

export const fullScreenStatusSelector = (state: SelectState) => {
  if (state.matches({ ready: { screenMode: 'fullscreen' } })) return 'fullscreen';
  if (state.matches({ ready: { screenMode: 'exitFullscreen' } })) return 'exitFullscreen';
  return 'idle';
};

export const isFullscreenSelector = (state: SelectState) =>
  state.matches({ ready: { screenMode: 'fullscreen' } });

export const bezelStatusSelector = (state: SelectState) => {
  const bezelStates = ['play', 'stop', 'forward', 'backward', 'volume-up', 'volume-down'] as const;
  for (const bezelState of bezelStates) {
    if (state.matches({ ready: { bezelStatus: bezelState } })) {
      return bezelState;
    }
  }
  return null;
};

export const isAutoQualitySelector = (state: SelectState) =>
  state.matches({ ready: { quality: 'auto' } });

// Context selectors
export const durationSelector = (state: SelectState) => state.context?.duration ?? 0;

export const playedSelector = (state: SelectState) => state.context?.played ?? 0;

export const playedSecondsSelector = (state: SelectState) => state.context?.playedSeconds ?? 0;

export const loadedSelector = (state: SelectState) => state.context?.loaded ?? 0;

export const loadedSecondsSelector = (state: SelectState) => state.context?.loadedSeconds ?? 0;

export const currentTimeSelector = (state: SelectState) =>
  durationSelector(state) * playedSelector(state);

export const volumeSelector = (state: SelectState) => state.context?.volume ?? 1;

export const mutedSelector = (state: SelectState) => state.context?.muted ?? false;

export const speedSelector = (state: SelectState) => state.context?.speed ?? 1;

export const currentLevelSelector = (state: SelectState) => state.context?.currentLevel ?? -1;

export const levelsSelector = (state: SelectState) => state.context?.levels ?? [];

export const captionsSelector = (state: SelectState) => state.context?.captions ?? [];

export const captionsCurrentIndexSelector = (state: SelectState) =>
  state.context?.captionsCurrentIndex ?? -1;

export const scriptsSelector = (state: SelectState) => state.context?.scripts ?? [];

export const scriptsCurrentIndexSelector = (state: SelectState) =>
  state.context?.scriptsCurrentIndex ?? -1;

export const seekNumberSelector = (state: SelectState) => state.context?.seekNumber ?? null;

export const currentCaptionSelector = (state: SelectState) => {
  const captions = captionsSelector(state);
  const index = captionsCurrentIndexSelector(state);
  return index >= 0 && index < captions.length ? captions[index] : null;
};

export const currentScriptSelector = (state: SelectState) => {
  const scripts = scriptsSelector(state);
  const index = scriptsCurrentIndexSelector(state);
  return index >= 0 && index < scripts.length ? scripts[index] : null;
};

export const captionsEnabledSelector = (state: SelectState) =>
  state.context?.captionsEnabled ?? true;

export const captionTracksSelector = (state: SelectState) =>
  state.context?.captionTracks ?? [];

export const currentCaptionTrackIdSelector = (state: SelectState) =>
  state.context?.currentCaptionTrackId ?? null;

export const currentCaptionTrackSelector = (state: SelectState) => {
  const tracks = captionTracksSelector(state);
  const currentId = currentCaptionTrackIdSelector(state);
  return tracks.find((track) => track.id === currentId) ?? null;
};

export const transcriptEnabledSelector = (state: SelectState) =>
  state.context?.transcriptEnabled ?? false;
