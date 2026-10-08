import { token } from './token';

export const ANIMATION_TOKENS = {
  duration: {
    instant: token('0.075', { unit: 'number' }),
    fast: token('0.15', { unit: 'number' }),
    normal: token('0.3', { unit: 'number' }),
    slow: token('1.5', { unit: 'number' }),
  },
};
