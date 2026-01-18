import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    video: 'src/video/index.ts',
    audio: 'src/audio/index.ts',
    captions: 'src/captions/index.ts',
    machine: 'src/machine/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  treeshake: true,
  clean: true,
  external: ['react', 'react-dom', 'react-player', 'react-player/lazy'],
  sourcemap: true,
  banner: {
    js: '"use client";',
  },
});
