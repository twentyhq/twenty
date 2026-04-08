export function formatLightIntensity(value: number) {
  return value.toFixed(1);
}

export function formatFillIntensity(value: number) {
  return value.toFixed(2);
}

export function formatAmbientIntensity(value: number) {
  return value.toFixed(2);
}

export function formatAngle(value: number) {
  return `${value}°`;
}

export function formatHeight(value: number) {
  return value.toFixed(1);
}

export function formatDecimal(value: number, digits = 2) {
  return value.toFixed(digits);
}

export function formatRows(value: number) {
  return String(value);
}

export function formatAnimationName(
  mode: 'none' | 'autoRotate' | 'followHover' | 'followDrag',
  rotateEnabled: boolean,
) {
  const activeModes: string[] = [];

  if (mode !== 'none') {
    activeModes.push(mode);
  }

  if (rotateEnabled) {
    activeModes.push('rotate');
  }

  return activeModes.length > 0 ? activeModes.join(' + ') : 'still';
}

export function getBackgroundTone(background: {
  color: string;
  transparent: boolean;
}) {
  if (background.transparent) {
    return 'light';
  }

  const normalized = background.color.replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((character) => `${character}${character}`)
          .join('')
      : normalized;

  const value = Number.parseInt(expanded, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance < 0.5 ? 'dark' : 'light';
}
