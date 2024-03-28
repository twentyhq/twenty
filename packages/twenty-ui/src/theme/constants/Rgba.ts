import hexRgb from 'hex-rgb';

export const RGBA = (hex: string, alpha: number) => {
  /* eslint-disable-next-line @nx/workspace-no-hardcoded-colors */
  return `rgba(${hexRgb(hex, { format: 'array' })
    .slice(0, -1)
    .join(',')},${alpha})`;
};
