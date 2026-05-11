export const ChipVariant = {
  Highlighted: 'highlighted',
  Regular: 'regular',
  Transparent: 'transparent',
  Rounded: 'rounded',
  Static: 'static',
} as const;

export type ChipVariant = (typeof ChipVariant)[keyof typeof ChipVariant];
