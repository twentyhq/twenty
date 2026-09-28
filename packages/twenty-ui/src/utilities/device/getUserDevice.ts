import { isString } from '@sniptt/guards';

export const getUserDevice = () => {
  const userAgent = globalThis.navigator?.userAgent;

  if (!isString(userAgent)) {
    return 'unknown';
  }

  const normalizedUserAgent = userAgent.toLowerCase();

  if (
    normalizedUserAgent.includes('ios') ||
    normalizedUserAgent.includes('iphone') ||
    normalizedUserAgent.includes('ipad')
  ) {
    return 'ios';
  }

  if (
    normalizedUserAgent.includes('mac os x') ||
    normalizedUserAgent.includes('macos')
  ) {
    return 'mac';
  }

  if (normalizedUserAgent.includes('windows')) {
    return 'windows';
  }

  if (normalizedUserAgent.includes('android')) {
    return 'android';
  }

  if (normalizedUserAgent.includes('linux')) {
    return 'linux';
  }

  return 'unknown';
};
