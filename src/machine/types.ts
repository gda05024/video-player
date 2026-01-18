import type { Level } from 'hls.js';

export interface Caption {
  startTime: number;
  endTime: number;
  text: string;
}

export interface CaptionTrack {
  id: string;
  label: string;
  language: string;
  src: string;
}

export interface ReadyContext {
  currentLevel: number;
  levels: Array<Pick<Level, 'height' | 'width' | 'urlId'>>;
  duration: number;
  volume: number;
  muted: boolean;
}

export interface ProgressContext {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
}

export interface PlayerMachineContext extends Partial<ReadyContext & ProgressContext> {
  currentLevel: number;
  levels: Array<Pick<Level, 'height' | 'width' | 'urlId'>>;
  duration: number;
  volume: number;
  muted: boolean;
  speed: number;
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
  seekNumber: number | null;
  captions: Caption[];
  captionsCurrentIndex: number;
  captionsEnabled: boolean;
  captionTracks: CaptionTrack[];
  currentCaptionTrackId: string | null;
  scripts: Caption[];
  scriptsCurrentIndex: number;
  transcriptEnabled: boolean;
}

export type BezelStatusType = 'play' | 'stop' | 'forward' | 'backward' | 'volume-up' | 'volume-down' | null;

export interface ShowBezelStatus {
  showBezelStatus?: boolean;
}

export type PlayerMachineEvent =
  | ({ type: 'PLAY' } & ShowBezelStatus)
  | ({ type: 'STOP' } & ShowBezelStatus)
  | { type: 'SEEKING'; seekTo: number }
  | { type: 'SEEKED' }
  | ({ type: 'FORWARD_SEEKING'; seekToSec: number } & ShowBezelStatus)
  | ({ type: 'BACKWARD_SEEKING'; seekToSec: number } & ShowBezelStatus)
  | { type: 'READY'; readyContext: Partial<ReadyContext> }
  | { type: 'PROGRESS'; progressContext: ProgressContext }
  | ({ type: 'SET_VOLUME'; volume: number } & ShowBezelStatus)
  | ({ type: 'VOLUME_UP'; volume: number } & ShowBezelStatus)
  | ({ type: 'VOLUME_DOWN'; volume: number } & ShowBezelStatus)
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'SET_QUALITY'; level: number }
  | { type: 'SET_AUTO_QUALITY' }
  | { type: 'SET_MUTED'; muted: boolean }
  | { type: 'SET_CAPTIONS'; captions: Caption[] }
  | { type: 'SET_SCRIPTS'; scripts: Caption[] }
  | { type: 'UPDATE_CAPTIONS_INDEX'; index: number }
  | { type: 'UPDATE_SCRIPTS_INDEX'; index: number }
  | { type: 'TOGGLE_CAPTIONS' }
  | { type: 'SET_CAPTIONS_ENABLED'; enabled: boolean }
  | { type: 'SET_CAPTION_TRACKS'; tracks: CaptionTrack[] }
  | { type: 'SELECT_CAPTION_TRACK'; trackId: string | null }
  | { type: 'TOGGLE_TRANSCRIPT' }
  | { type: 'SET_TRANSCRIPT_ENABLED'; enabled: boolean }
  | { type: 'SHOW_TOOLBAR' }
  | { type: 'HIDE_TOOLBAR' }
  | { type: 'LOADING_START' }
  | { type: 'LOADING_END' }
  | { type: 'ENTER_FULLSCREEN' }
  | { type: 'EXIT_FULLSCREEN' }
  | { type: 'BUFFERING' }
  | { type: 'BUFFER_END' };
