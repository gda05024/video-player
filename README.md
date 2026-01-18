# Video Player

React 기반 비디오/오디오 플레이어 컴포넌트 라이브러리입니다. XState 상태 머신을 사용하여 구현되었습니다.

## Features

- HLS 스트리밍 지원
- 자막 (VTT) 지원
- 대본 패널 (Transcript)
- 재생 속도 조절
- 볼륨 조절
- 전체화면
- 키보드 단축키

## Keyboard Shortcuts

| 단축키 | 기능 |
|--------|------|
| Space | 재생/일시정지 |
| ← | 10초 뒤로 |
| → | 10초 앞으로 |
| ↑ | 볼륨 업 |
| ↓ | 볼륨 다운 |
| ⌘/Ctrl + M | 음소거 토글 |
| ⌘/Ctrl + F | 전체화면 토글 |

## Installation

```bash
npm install @gda05024/video-player
```

## Usage

```tsx
import { VideoPlayer } from '@gda05024/video-player/video';
import { Toolbar, PlayButton, ProgressBar } from '@gda05024/video-player/video';

function App() {
  return (
    <VideoPlayer
      url="https://example.com/video.mp4"
      toolbar={
        <Toolbar
          progressBar={<ProgressBar />}
          leftSlot={<PlayButton />}
        />
      }
    />
  );
}
```

## License

MIT
