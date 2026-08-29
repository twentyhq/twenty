import { Color } from 'ogl';

function srgbChannelToLinear(channel: number) {
  return channel < 0.04045
    ? channel * 0.0773993808
    : Math.pow(channel * 0.9478672986 + 0.0521327014, 2.4);
}

function parseHex(hex: number | string) {
  if (typeof hex === 'number') {
    return Math.floor(hex);
  }
  const digits = hex.replace('#', '');
  if (digits.length === 3) {
    return parseInt(
      digits
        .split('')
        .map((digit) => digit + digit)
        .join(''),
      16,
    );
  }
  return parseInt(digits.slice(0, 6), 16);
}

// three's Color decodes hex through sRGB into its linear working space, and
// every authored colour in these scenes was tuned against that. ogl's Color
// parses hex as raw 0-1, so the decode has to happen here or every dash and
// glow shifts brightness.
export function linearColorFromHex(hex: number | string) {
  const value = parseHex(hex);
  return new Color(
    srgbChannelToLinear(((value >> 16) & 255) / 255),
    srgbChannelToLinear(((value >> 8) & 255) / 255),
    srgbChannelToLinear((value & 255) / 255),
  );
}
