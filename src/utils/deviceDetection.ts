/**
 * Check if the current device is iOS (iPhone, iPad, iPod)
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPad on iOS 13+ uses desktop Safari user agent
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Check if the current browser is Safari
 */
export function isSafari(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('android');
}

/**
 * Check if the current device is Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  return /android/i.test(navigator.userAgent);
}

/**
 * Check if the current device is a mobile device (iOS or Android)
 */
export function isMobile(): boolean {
  return isIOS() || isAndroid();
}

/**
 * Check if the current device is a tablet
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent.toLowerCase();
  return (
    /ipad/.test(ua) ||
    (/android/.test(ua) && !/mobile/.test(ua)) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Check if the current device supports touch events
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const msMaxTouchPoints = (navigator as Navigator & { msMaxTouchPoints?: number }).msMaxTouchPoints;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (msMaxTouchPoints !== undefined && msMaxTouchPoints > 0)
  );
}

/**
 * Check if the current browser supports HLS natively
 */
export function supportsNativeHls(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  const video = document.createElement('video');
  return Boolean(
    video.canPlayType('application/vnd.apple.mpegurl') ||
    video.canPlayType('audio/mpegurl')
  );
}

/**
 * Check if the browser supports MediaSource Extensions (MSE)
 * Required for hls.js
 */
export function supportsMSE(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return 'MediaSource' in window;
}

/**
 * Check if fullscreen API is supported
 */
export function supportsFullscreen(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  const doc = document as Document & {
    webkitFullscreenEnabled?: boolean;
    mozFullScreenEnabled?: boolean;
    msFullscreenEnabled?: boolean;
  };

  return Boolean(
    doc.fullscreenEnabled ||
    doc.webkitFullscreenEnabled ||
    doc.mozFullScreenEnabled ||
    doc.msFullscreenEnabled
  );
}

/**
 * Get the current device type
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function getDeviceType(): DeviceType {
  if (isTablet()) return 'tablet';
  if (isMobile()) return 'mobile';
  return 'desktop';
}
