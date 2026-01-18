'use client';

import dynamic from 'next/dynamic';
import { useRef, useState, type MutableRefObject } from 'react';
import type { VideoPlayerRef } from '../../../src/video/VideoPlayer';

const VideoPlayerDemo = dynamic(
  () => import('../components/VideoPlayerDemo'),
  { ssr: false }
);

const SAMPLE_VIDEOS = [
  {
    name: 'Big Buck Bunny (YouTube)',
    url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
  },
  {
    name: 'Elephants Dream',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
  {
    name: 'Sintel',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  },
];

export default function Home() {
  const playerRef = useRef<VideoPlayerRef>(null);
  const [selectedVideo, setSelectedVideo] = useState(SAMPLE_VIDEOS[0]);

  return (
    <main style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 20 }}>Video Demo</h1>

      <div style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 10 }}>Select Video:</label>
        <select
          value={selectedVideo.url}
          onChange={(e) => {
            const video = SAMPLE_VIDEOS.find((v) => v.url === e.target.value);
            if (video) setSelectedVideo(video);
          }}
          style={{ padding: '8px 12px', fontSize: 14 }}
        >
          {SAMPLE_VIDEOS.map((video) => (
            <option key={video.url} value={video.url}>
              {video.name}
            </option>
          ))}
        </select>
      </div>

      <VideoPlayerDemo
        playerRef={playerRef as MutableRefObject<VideoPlayerRef | null>}
        url={selectedVideo.url}
      />

      <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {/* Playback */}
        <button onClick={() => playerRef.current?.play()}>Play</button>
        <button onClick={() => playerRef.current?.pause()}>Pause</button>
        <button onClick={() => playerRef.current?.togglePlay()}>Toggle Play</button>

        {/* Seeking */}
        <button onClick={() => playerRef.current?.service.send({ type: 'BACKWARD_SEEKING', seekToSec: 10, showBezelStatus: true })}>
          -10s
        </button>
        <button onClick={() => playerRef.current?.service.send({ type: 'FORWARD_SEEKING', seekToSec: 10, showBezelStatus: true })}>
          +10s
        </button>
        <button onClick={() => playerRef.current?.seekTo(30)}>Seek 30s</button>
        <button onClick={() => playerRef.current?.seekTo(60)}>Seek 60s</button>

        {/* Speed */}
        <button onClick={() => playerRef.current?.setSpeed(0.5)}>0.5x</button>
        <button onClick={() => playerRef.current?.setSpeed(1)}>1x</button>
        <button onClick={() => playerRef.current?.setSpeed(1.5)}>1.5x</button>
        <button onClick={() => playerRef.current?.setSpeed(2)}>2x</button>

        {/* Volume */}
        <button onClick={() => playerRef.current?.service.send({ type: 'SET_MUTED', muted: !playerRef.current?.service.getSnapshot().context.muted })}>
          Mute Toggle (⌘M)
        </button>
        <button onClick={() => playerRef.current?.setVolume(0.5)}>Vol 50%</button>
        <button onClick={() => playerRef.current?.setVolume(1)}>Vol 100%</button>

        {/* Transcript */}
        <button onClick={() => playerRef.current?.service.send({ type: 'TOGGLE_TRANSCRIPT' })}>
          Toggle Transcript
        </button>

        {/* Fullscreen */}
        <button onClick={() => playerRef.current?.toggleFullscreen()}>
          Fullscreen (⌘F)
        </button>
      </div>

      <div style={{ marginTop: 30, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
        <h3>Keyboard Shortcuts</h3>
        <ul>
          <li>Space - Play/Pause</li>
          <li>← / → - Seek 10s</li>
          <li>↑ / ↓ - Volume</li>
          <li>⌘/Ctrl + M - Mute</li>
          <li>⌘/Ctrl + F - Fullscreen</li>
        </ul>
      </div>
    </main>
  );
}
