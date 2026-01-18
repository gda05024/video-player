/**
 * Format seconds into a time string (MM:SS or HH:MM:SS)
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) {
    return '0:00';
  }

  const totalSeconds = Math.floor(Math.abs(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const prefix = seconds < 0 ? '-' : '';

  if (hours > 0) {
    return `${prefix}${hours}:${padZero(minutes)}:${padZero(secs)}`;
  }

  return `${prefix}${minutes}:${padZero(secs)}`;
}

/**
 * Pad a number with leading zero if needed
 */
function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

/**
 * Parse a time string (MM:SS or HH:MM:SS) into seconds
 */
export function parseTime(timeString: string): number {
  const parts = timeString.split(':').map(Number);

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
}

/**
 * Format seconds into a duration string (e.g., "1h 23m" or "5m 30s")
 */
export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) {
    return '0s';
  }

  const totalSeconds = Math.floor(Math.abs(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}s`);
  }

  return parts.join(' ');
}
