import hexRgb from 'hex-rgb';

export const mainColors = {
  white: '#ffffff',
};

export const secondaryColors = {
  gray60: '#141414',
  gray50: '#474747',
  gray40: '#818181',
  gray30: '#b3b3b3',
  gray20: '#f1f1f1',
  gray10: '#fafafa',
};

export const Color = {
  ...mainColors,
  ...secondaryColors,
};

export const rgba = (hex: string, alpha: number) => {
  const rgb = hexRgb(hex, { format: 'array' }).slice(0, -1).join(',');
  return `rgba(${rgb},${alpha})`;
};
