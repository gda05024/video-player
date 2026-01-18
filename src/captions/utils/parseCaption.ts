import type { Caption } from '../../machine/types';

/**
 * Parse VTT (WebVTT) content into caption array
 */
export function parseVTT(content: string): Caption[] {
  const captions: Caption[] = [];
  const lines = content.trim().split('\n');

  let i = 0;

  // Skip WEBVTT header
  if (lines[0]?.startsWith('WEBVTT')) {
    i = 1;
    // Skip any header metadata
    while (i < lines.length && lines[i].trim() !== '') {
      i++;
    }
  }

  while (i < lines.length) {
    const line = lines[i].trim();

    // Skip empty lines and cue identifiers
    if (line === '' || /^\d+$/.test(line)) {
      i++;
      continue;
    }

    // Check for timestamp line (00:00:00.000 --> 00:00:00.000)
    const timestampMatch = line.match(
      /(\d{2}:)?(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}:)?(\d{2}):(\d{2})\.(\d{3})/
    );

    if (timestampMatch) {
      const startTime = parseVTTTimestamp(line.split('-->')[0].trim());
      const endTime = parseVTTTimestamp(line.split('-->')[1].trim());

      // Collect text lines
      const textLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== '') {
        textLines.push(lines[i].trim());
        i++;
      }

      if (textLines.length > 0) {
        captions.push({
          startTime,
          endTime,
          text: textLines.join('\n'),
        });
      }
    } else {
      i++;
    }
  }

  return captions;
}

/**
 * Parse VTT timestamp to seconds
 */
function parseVTTTimestamp(timestamp: string): number {
  const cleaned = timestamp.trim().split(' ')[0]; // Remove any positioning info
  const parts = cleaned.split(':');

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (parts.length === 3) {
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
    seconds = parseFloat(parts[2]);
  } else if (parts.length === 2) {
    minutes = parseInt(parts[0], 10);
    seconds = parseFloat(parts[1]);
  }

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Parse SRT (SubRip) content into caption array
 */
export function parseSRT(content: string): Caption[] {
  const captions: Caption[] = [];
  const blocks = content.trim().split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.split('\n');

    if (lines.length < 2) continue;

    // Find timestamp line
    let timestampLineIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('-->')) {
        timestampLineIndex = i;
        break;
      }
    }

    const timestampLine = lines[timestampLineIndex];
    const timestampMatch = timestampLine?.match(
      /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/
    );

    if (timestampMatch) {
      const startTime = parseSRTTimestamp(timestampLine.split('-->')[0].trim());
      const endTime = parseSRTTimestamp(timestampLine.split('-->')[1].trim());

      const textLines = lines.slice(timestampLineIndex + 1).filter((l) => l.trim() !== '');
      const text = textLines.join('\n');

      if (text) {
        captions.push({
          startTime,
          endTime,
          text: stripHtmlTags(text),
        });
      }
    }
  }

  return captions;
}

/**
 * Parse SRT timestamp to seconds
 */
function parseSRTTimestamp(timestamp: string): number {
  const parts = timestamp.trim().split(':');

  if (parts.length !== 3) return 0;

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const secondsParts = parts[2].split(',');
  const seconds = parseInt(secondsParts[0], 10);
  const milliseconds = parseInt(secondsParts[1], 10);

  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

/**
 * Strip HTML tags from text
 */
function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

/**
 * Auto-detect caption format and parse
 */
export function parseCaption(content: string): Caption[] {
  const trimmed = content.trim();

  if (trimmed.startsWith('WEBVTT')) {
    return parseVTT(trimmed);
  }

  // SRT format starts with a number
  if (/^\d+\s*\n/.test(trimmed)) {
    return parseSRT(trimmed);
  }

  // Try VTT format as fallback
  return parseVTT(trimmed);
}

/**
 * Find caption index for a given time
 */
export function findCaptionIndex(captions: Caption[], currentTime: number): number {
  for (let i = 0; i < captions.length; i++) {
    const caption = captions[i];
    if (currentTime >= caption.startTime && currentTime <= caption.endTime) {
      return i;
    }
  }
  return -1;
}

/**
 * Load captions from a URL
 */
export async function loadCaptionsFromUrl(url: string): Promise<Caption[]> {
  const response = await fetch(url);
  const content = await response.text();
  return parseCaption(content);
}
