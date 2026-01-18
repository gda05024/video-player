'use client';

import { type MutableRefObject } from 'react';
// Import directly from source for development
import { VideoPlayer, type VideoPlayerRef } from '../../../src/video/VideoPlayer';
import { Toolbar } from '../../../src/video/controls/Toolbar';
import { PlayButton } from '../../../src/video/controls/PlayButton';
import { ProgressBar } from '../../../src/video/controls/ProgressBar';
import { VolumeControl } from '../../../src/video/controls/VolumeControl';
import { TimeDisplay } from '../../../src/video/controls/TimeDisplay';
import { SkipButton } from '../../../src/video/controls/SkipButton';
import { SettingsMenu } from '../../../src/video/controls/SettingsMenu';
import { FullscreenButton } from '../../../src/video/controls/FullscreenButton';
import { BezelStatus } from '../../../src/video/overlays/BezelStatus';
import { LoadingOverlay } from '../../../src/video/overlays/LoadingOverlay';
import { ScreenActionArea } from '../../../src/video/overlays/ScreenActionArea';
import { TranscriptPanel } from '../../../src/captions/TranscriptPanel';
import { CaptionRenderer } from '../../../src/captions/CaptionRenderer';
import type { CaptionTrack } from '../../../src/machine/types';

const CAPTION_TRACKS: CaptionTrack[] = [
  { id: 'en', label: 'English', language: 'en', src: '/subs/english.vtt' },
  { id: 'de', label: 'German', language: 'de', src: '/subs/german.vtt' },
  { id: 'it', label: 'Italian', language: 'it', src: '/subs/italian.vtt' },
  { id: 'es', label: 'Spanish', language: 'es', src: '/subs/spanish.vtt' },
];

interface VideoPlayerDemoProps {
  playerRef: MutableRefObject<VideoPlayerRef | null>;
  url: string;
}

export default function VideoPlayerDemo({ playerRef, url }: VideoPlayerDemoProps) {
  return (
    <div style={{ background: '#000', borderRadius: 8, overflow: 'hidden' }}>
      <VideoPlayer
        ref={playerRef}
        url={url}
        aspectRatio="16 / 9"
        captionTracks={CAPTION_TRACKS}
        onReady={() => console.log('Ready')}
        onPlay={() => console.log('Play')}
        onPause={() => console.log('Pause')}
        onError={(e) => console.error('Error:', e)}
        captionRenderer={<CaptionRenderer />}
        toolbar={
          <Toolbar
            progressBar={<ProgressBar showTime={false} />}
            leftSlot={
              <>
                <PlayButton />
                <SkipButton direction="backward" seconds={10} />
                <SkipButton direction="forward" seconds={10} />
                <VolumeControl />
                <TimeDisplay style={{ marginLeft: '8px' }} />
              </>
            }
            rightSlot={
              <>
                <SettingsMenu />
                <FullscreenButton />
              </>
            }
          />
        }
        bezelStatus={<BezelStatus />}
        loadingOverlay={<LoadingOverlay />}
        screenActionArea={<ScreenActionArea />}
        transcriptPanel={
          <TranscriptPanel
            style={{ height: '100%' }}
            title="Transcript"
          />
        }
      />
    </div>
  );
}
