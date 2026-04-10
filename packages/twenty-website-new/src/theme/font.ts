export const font = {
  family: {
    sans: 'var(--font-sans), sans-serif',
    serif: 'var(--font-serif), serif',
    mono: 'var(--font-mono), monospace',
    retro: 'var(--font-retro), monospace',
  },
  weight: { light: '300', regular: '400', medium: '500' },
  size: (multiplier: number) => `calc(var(--font-base) * ${multiplier})`,
};
