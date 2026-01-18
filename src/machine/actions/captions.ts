import { assign } from 'xstate';
import type { PlayerMachineContext, PlayerMachineEvent } from '../types';

export const setCaptions = assign<PlayerMachineContext, PlayerMachineEvent>((context, event) => {
  if (event.type !== 'SET_CAPTIONS') return context;
  return {
    ...context,
    captions: event.captions,
    captionsCurrentIndex: -1,
  };
});

export const setScripts = assign<PlayerMachineContext, PlayerMachineEvent>((context, event) => {
  if (event.type !== 'SET_SCRIPTS') return context;
  return {
    ...context,
    scripts: event.scripts,
    scriptsCurrentIndex: -1,
  };
});

export const updateCaptionsIndex = assign<PlayerMachineContext, PlayerMachineEvent>(
  (context, event) => {
    if (event.type !== 'UPDATE_CAPTIONS_INDEX') return context;
    return {
      ...context,
      captionsCurrentIndex: event.index,
    };
  }
);

export const updateScriptsIndex = assign<PlayerMachineContext, PlayerMachineEvent>(
  (context, event) => {
    if (event.type !== 'UPDATE_SCRIPTS_INDEX') return context;
    return {
      ...context,
      scriptsCurrentIndex: event.index,
    };
  }
);

export const toggleCaptions = assign<PlayerMachineContext, PlayerMachineEvent>((context, event) => {
  if (event.type !== 'TOGGLE_CAPTIONS') return context;
  return {
    ...context,
    captionsEnabled: !context.captionsEnabled,
  };
});

export const setCaptionsEnabled = assign<PlayerMachineContext, PlayerMachineEvent>(
  (context, event) => {
    if (event.type !== 'SET_CAPTIONS_ENABLED') return context;
    return {
      ...context,
      captionsEnabled: event.enabled,
    };
  }
);

export const toggleTranscript = assign<PlayerMachineContext, PlayerMachineEvent>(
  (context, event) => {
    if (event.type !== 'TOGGLE_TRANSCRIPT') return context;
    return {
      ...context,
      transcriptEnabled: !context.transcriptEnabled,
    };
  }
);

export const setTranscriptEnabled = assign<PlayerMachineContext, PlayerMachineEvent>(
  (context, event) => {
    if (event.type !== 'SET_TRANSCRIPT_ENABLED') return context;
    return {
      ...context,
      transcriptEnabled: event.enabled,
    };
  }
);

export const setCaptionTracks = assign<PlayerMachineContext, PlayerMachineEvent>(
  (context, event) => {
    if (event.type !== 'SET_CAPTION_TRACKS') return context;
    return {
      ...context,
      captionTracks: event.tracks,
      // Auto-select first track if none selected
      currentCaptionTrackId:
        context.currentCaptionTrackId ?? (event.tracks.length > 0 ? event.tracks[0].id : null),
    };
  }
);

export const selectCaptionTrack = assign<PlayerMachineContext, PlayerMachineEvent>(
  (context, event) => {
    if (event.type !== 'SELECT_CAPTION_TRACK') return context;
    return {
      ...context,
      currentCaptionTrackId: event.trackId,
      captionsEnabled: event.trackId !== null,
      // Clear current captions when switching tracks
      captions: [],
      captionsCurrentIndex: -1,
    };
  }
);
