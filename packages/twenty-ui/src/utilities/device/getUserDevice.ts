import { isString } from '@sniptt/guards';

export const getUserDevice = () => {
  if (typeof navigator === 'undefined' || !isString(navigator?.userAgent)) {
    return 'unknown';
  }

  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes('mac os x') || userAgent.includes('macos')) {
    return 'mac';
  }

  if (userAgent.includes('windows')) {
    return 'windows';
  }

  if (userAgent.includes('linux')) {
    return 'linux';
  }

  if (userAgent.includes('android')) return 'android';

  if (
    userAgent.includes('ios') ||
    userAgent.includes('iphone') ||
    userAgent.includes('ipad')
  )
    return 'ios';

  return 'unknown';
};
