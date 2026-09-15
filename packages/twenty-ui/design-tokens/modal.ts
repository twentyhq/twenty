import { token } from './token';

export const MODAL_TOKENS = {
  size: {
    sm: {
      width: token('300px'),
    },
    md: {
      width: token('400px'),
    },
    lg: {
      width: token('53%'),
    },
    xl: {
      width: token('1200px'),
      height: token('800px'),
    },
    fullscreen: {
      width: token('calc(100dvw / var(--t-zoom, 1))'),
      height: token('calc(100dvh / var(--t-zoom, 1))'),
    },
  },
};
