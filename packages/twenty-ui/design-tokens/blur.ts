import { token } from './token';

export const BLUR_TOKENS = {
  light: token({
    light: 'blur(6px) saturate(200%) contrast(50%) brightness(130%)',
    dark: 'blur(6px) saturate(200%) contrast(100%) brightness(130%)',
  }),
  medium: token({
    light: 'blur(12px) saturate(200%) contrast(50%) brightness(130%)',
    dark: 'blur(12px) saturate(200%) contrast(100%) brightness(130%)',
  }),
  strong: token({
    light: 'blur(20px) saturate(200%) contrast(50%) brightness(130%)',
    dark: 'blur(20px) saturate(200%) contrast(100%) brightness(130%)',
  }),
};
