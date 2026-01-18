import { createMachine } from 'xstate';
import {
  ready,
  progress,
  seeking,
  seeked,
  forwardSeeking,
  backwardSeeking,
  setVolume,
  volumeUp,
  volumeDown,
  setMuted,
  setSpeed,
  setQuality,
  setCaptions,
  setScripts,
  updateCaptionsIndex,
  updateScriptsIndex,
  toggleCaptions,
  setCaptionsEnabled,
  toggleTranscript,
  setTranscriptEnabled,
  setCaptionTracks,
  selectCaptionTrack,
} from './actions';
import { guards } from './guards';
import type { PlayerMachineContext, PlayerMachineEvent } from './types';

const TOOLBAR_HIDE_DELAY = 3000;
const BEZEL_HIDE_DELAY = 500;

const initialContext: PlayerMachineContext = {
  currentLevel: -1,
  levels: [],
  duration: 0,
  volume: 1,
  muted: false,
  speed: 1,
  played: 0,
  playedSeconds: 0,
  loaded: 0,
  loadedSeconds: 0,
  seekNumber: null,
  captions: [],
  captionsCurrentIndex: -1,
  captionsEnabled: true,
  captionTracks: [],
  currentCaptionTrackId: null,
  scripts: [],
  scriptsCurrentIndex: -1,
  transcriptEnabled: false,
};

export const playerMachine = createMachine(
  {
    id: 'player',
    schema: {
      context: {} as PlayerMachineContext,
      events: {} as PlayerMachineEvent,
    },
    context: initialContext,
    initial: 'wait-ready',
    states: {
      'wait-ready': {
        always: [{ cond: 'isReady', target: 'ready' }],
        on: {
          READY: { actions: ['ready'] },
          SET_CAPTION_TRACKS: { actions: ['setCaptionTracks'] },
          SET_SCRIPTS: { actions: ['setScripts'] },
        },
      },
      ready: {
        type: 'parallel',
        states: {
          bezelStatus: {
            initial: 'idle',
            states: {
              idle: {
                on: {
                  PLAY: [{ cond: 'showBezelStatus', target: 'play' }],
                  STOP: [{ cond: 'showBezelStatus', target: 'stop' }],
                  FORWARD_SEEKING: [{ cond: 'showBezelStatus', target: 'forward' }],
                  BACKWARD_SEEKING: [{ cond: 'showBezelStatus', target: 'backward' }],
                  VOLUME_UP: [{ cond: 'showBezelStatus', target: 'volume-up' }],
                  VOLUME_DOWN: [{ cond: 'showBezelStatus', target: 'volume-down' }],
                },
              },
              play: {
                after: { [BEZEL_HIDE_DELAY]: 'idle' },
              },
              stop: {
                after: { [BEZEL_HIDE_DELAY]: 'idle' },
              },
              forward: {
                after: { [BEZEL_HIDE_DELAY]: 'idle' },
              },
              backward: {
                after: { [BEZEL_HIDE_DELAY]: 'idle' },
              },
              'volume-up': {
                after: { [BEZEL_HIDE_DELAY]: 'idle' },
              },
              'volume-down': {
                after: { [BEZEL_HIDE_DELAY]: 'idle' },
              },
            },
          },
          showToolbar: {
            initial: 'visible',
            states: {
              visible: {
                after: { [TOOLBAR_HIDE_DELAY]: 'hidden' },
                on: {
                  HIDE_TOOLBAR: 'hidden',
                  SEEKING: { target: 'visible', actions: ['seeking'] },
                  FORWARD_SEEKING: { target: 'visible', actions: ['forwardSeeking'] },
                  BACKWARD_SEEKING: { target: 'visible', actions: ['backwardSeeking'] },
                },
              },
              hidden: {
                on: {
                  SHOW_TOOLBAR: 'visible',
                  PLAY: 'visible',
                  STOP: 'visible',
                  SEEKING: { target: 'visible', actions: ['seeking'] },
                  FORWARD_SEEKING: { target: 'visible', actions: ['forwardSeeking'] },
                  BACKWARD_SEEKING: { target: 'visible', actions: ['backwardSeeking'] },
                },
              },
            },
          },
          loadingState: {
            initial: 'idle',
            states: {
              idle: {
                on: {
                  LOADING_START: 'loading',
                  BUFFERING: 'loading',
                },
              },
              loading: {
                on: {
                  LOADING_END: 'idle',
                  BUFFER_END: 'idle',
                },
              },
            },
          },
          quality: {
            initial: 'auto',
            states: {
              auto: {
                on: {
                  SET_QUALITY: { target: 'manual', actions: ['setQuality'] },
                },
              },
              manual: {
                on: {
                  SET_AUTO_QUALITY: { target: 'auto', actions: ['setQuality'] },
                  SET_QUALITY: { actions: ['setQuality'] },
                },
              },
            },
          },
          screenMode: {
            initial: 'idle',
            states: {
              idle: {
                on: {
                  ENTER_FULLSCREEN: 'fullscreen',
                },
              },
              fullscreen: {
                on: {
                  EXIT_FULLSCREEN: 'exitFullscreen',
                },
              },
              exitFullscreen: {
                on: {
                  ENTER_FULLSCREEN: 'fullscreen',
                },
              },
            },
          },
          video: {
            initial: 'pending',
            states: {
              pending: {
                on: {
                  PLAY: 'play',
                  STOP: 'stop',
                },
              },
              play: {
                on: {
                  STOP: 'stop',
                  PROGRESS: { actions: ['progress'] },
                },
              },
              stop: {
                on: {
                  PLAY: 'play',
                },
              },
            },
          },
        },
        on: {
          READY: { actions: ['ready'] },
          SEEKING: { actions: ['seeking'] },
          SEEKED: { actions: ['seeked'] },
          FORWARD_SEEKING: { actions: ['forwardSeeking'] },
          BACKWARD_SEEKING: { actions: ['backwardSeeking'] },
          SET_VOLUME: { actions: ['setVolume'] },
          VOLUME_UP: { actions: ['volumeUp'] },
          VOLUME_DOWN: { actions: ['volumeDown'] },
          SET_MUTED: { actions: ['setMuted'] },
          SET_SPEED: { actions: ['setSpeed'] },
          SET_CAPTIONS: { actions: ['setCaptions'] },
          SET_SCRIPTS: { actions: ['setScripts'] },
          UPDATE_CAPTIONS_INDEX: { actions: ['updateCaptionsIndex'] },
          UPDATE_SCRIPTS_INDEX: { actions: ['updateScriptsIndex'] },
          TOGGLE_CAPTIONS: { actions: ['toggleCaptions'] },
          SET_CAPTIONS_ENABLED: { actions: ['setCaptionsEnabled'] },
          SET_CAPTION_TRACKS: { actions: ['setCaptionTracks'] },
          SELECT_CAPTION_TRACK: { actions: ['selectCaptionTrack'] },
          TOGGLE_TRANSCRIPT: { actions: ['toggleTranscript'] },
          SET_TRANSCRIPT_ENABLED: { actions: ['setTranscriptEnabled'] },
        },
      },
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
  },
  {
    actions: {
      ready,
      progress,
      seeking,
      seeked,
      forwardSeeking,
      backwardSeeking,
      setVolume,
      volumeUp,
      volumeDown,
      setMuted,
      setSpeed,
      setQuality,
      setCaptions,
      setScripts,
      updateCaptionsIndex,
      updateScriptsIndex,
      toggleCaptions,
      setCaptionsEnabled,
      setCaptionTracks,
      selectCaptionTrack,
      toggleTranscript,
      setTranscriptEnabled,
    },
    guards,
  }
);

export type PlayerMachine = typeof playerMachine;
