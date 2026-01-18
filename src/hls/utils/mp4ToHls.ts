import axios from 'axios';

// CDN configuration
const CLOUD_FRONT_ORIGIN = 'https://d2b8xhxnbw3abm.cloudfront.net';
const AWS_S3_ORIGIN = 'https://s3.ap-northeast-2.amazonaws.com/mildang';
const MILDANG_S3_ORIGIN = 'https://mildang.s3.ap-northeast-2.amazonaws.com';
const MILDANG_CLOUD_FRONT_ORIGIN = 'https://d2b8xhxnbw3abm.cloudfront.net';
const KAIDT_CDN_ORIGIN = 'https://cdn.kaidt.com';

// URL conversion patterns
const convertPattern: Record<string, (url: string) => string> = {
  'https://s3.ap-northeast-2.amazonaws.com/mildang': (url: string) => {
    return url
      .replace(
        'https://s3.ap-northeast-2.amazonaws.com/mildang/data',
        'https://d2b8xhxnbw3abm.cloudfront.net/data/hls'
      )
      .replace(/mp4$/, 'm3u8');
  },
  'https://mildang.s3.ap-northeast-2.amazonaws.com': (url: string) => {
    return url
      .replace(
        'https://mildang.s3.ap-northeast-2.amazonaws.com/data',
        'https://d2b8xhxnbw3abm.cloudfront.net/data/hls'
      )
      .replace(/mp4$/, 'm3u8');
  },
};

function convertKAidtVideoUrl(url: string): string {
  // KAIDT CDN specific conversion
  return url.replace(/\.mp4$/, '/playlist.m3u8');
}

function getUrlSuffix(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const lastDot = pathname.lastIndexOf('.');
    if (lastDot === -1) return '';
    return pathname.substring(lastDot + 1).toLowerCase();
  } catch {
    return '';
  }
}

function getFilename(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const lastSlash = pathname.lastIndexOf('/');
    return pathname.substring(lastSlash + 1);
  } catch {
    return '';
  }
}

function getPath(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    return '';
  }
}

export interface Mp4ToHlsOptions {
  verifyUrl?: boolean;
  timeout?: number;
}

/**
 * Convert an MP4 URL to HLS m3u8 URL if possible
 * @param url - The original video URL
 * @param options - Conversion options
 * @returns The HLS URL if conversion is possible, otherwise the original URL
 */
export async function mp4ToHls(
  url: string,
  options: Mp4ToHlsOptions = {}
): Promise<string> {
  const { verifyUrl = true, timeout = 5000 } = options;

  const trimmedUrl = url.trim();
  const suffix = getUrlSuffix(trimmedUrl);

  // Handle KAIDT CDN
  if (trimmedUrl.startsWith(KAIDT_CDN_ORIGIN)) {
    return convertKAidtVideoUrl(trimmedUrl);
  }

  // Check for pattern matches
  const patterns = Object.keys(convertPattern);
  const matchedPattern = patterns.find((p) => trimmedUrl.startsWith(p));

  // Return original URL if not a Mildang S3/CloudFront URL
  if (!trimmedUrl.startsWith(AWS_S3_ORIGIN) && !matchedPattern) {
    if (trimmedUrl.startsWith(MILDANG_S3_ORIGIN)) {
      return trimmedUrl.replace(MILDANG_S3_ORIGIN, MILDANG_CLOUD_FRONT_ORIGIN);
    }
    return trimmedUrl;
  }

  // Skip non-MP4 files
  if (suffix !== 'mp4') {
    return trimmedUrl;
  }

  const filename = getFilename(trimmedUrl);
  const path = getPath(trimmedUrl);

  let hlsURL = '';

  if (matchedPattern) {
    const convert = convertPattern[matchedPattern];
    hlsURL = convert(trimmedUrl);
  } else {
    // Default CloudFront HLS path
    const baseName = filename.replace(/\.mp4$/i, '');
    hlsURL = `${CLOUD_FRONT_ORIGIN}/hls/${baseName}.m3u8`;
  }

  if (!verifyUrl) {
    return hlsURL;
  }

  // Verify HLS URL exists
  try {
    const response = await axios.head(hlsURL, { timeout });
    if (response.status === 200) {
      return hlsURL;
    }
  } catch {
    // HLS URL not available, try CloudFront direct path
  }

  // Fallback to CloudFront direct path
  try {
    const cloudFrontURL = `${CLOUD_FRONT_ORIGIN}${path}`;
    const cloudFrontResponse = await axios.head(cloudFrontURL, { timeout });
    if (cloudFrontResponse.status === 200) {
      return cloudFrontURL;
    }
  } catch {
    // CloudFront URL not available either
  }

  // Return original URL as last resort
  return trimmedUrl;
}

/**
 * Check if a URL is already an HLS URL
 */
export function isHlsUrl(url: string): boolean {
  const suffix = getUrlSuffix(url);
  return suffix === 'm3u8';
}

/**
 * Check if a URL is a supported video format
 */
export function isSupportedVideoUrl(url: string): boolean {
  const suffix = getUrlSuffix(url);
  return ['mp4', 'm3u8', 'webm', 'ogg'].includes(suffix);
}
