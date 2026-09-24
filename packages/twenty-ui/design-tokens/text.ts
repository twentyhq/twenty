import { token } from './token';

export const TEXT_TOKENS = {
  lineHeight: {
    lg: token('1.5', { unit: 'number' }),
    md: token('1.1', { unit: 'number' }),
  },
  iconSizeMedium: token('16', { unit: 'number' }),
  iconSizeSmall: token('14', { unit: 'number' }),
  iconStrikeLight: token('1.6', { unit: 'number' }),
  iconStrikeMedium: token('2', { unit: 'number' }),
  iconStrikeBold: token('2.5', { unit: 'number' }),
};
