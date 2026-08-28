import { token } from './token';

export const BOX_SHADOW_TOKENS = {
  color: token({
    light: 'color(display-p3 0 0 0 / 0.039)',
    dark: 'rgba(0, 0, 0, 0.6)',
  }),
  light: token({
    light:
      '0px 2px 4px 0px color(display-p3 0 0 0 / 0.039), 0px 0px 4px 0px color(display-p3 0 0 0 / 0.078)',
    dark: '0px 2px 4px 0px rgba(0, 0, 0, 0.04), 0px 0px 4px 0px rgba(0, 0, 0, 0.08)',
  }),
  strong: token({
    light:
      '2px 4px 16px 0px color(display-p3 0 0 0 / 0.161), 0px 2px 4px 0px color(display-p3 0 0 0 / 0.078)',
    dark: '2px 4px 16px 0px rgba(0, 0, 0, 0.16), 0px 2px 4px 0px rgba(0, 0, 0, 0.08)',
  }),
  underline: token({
    light: '0px 1px 0px 0px color(display-p3 0 0 0 / 0.361)',
    dark: '0px 1px 0px 0px rgba(0, 0, 0, 0.32)',
  }),
  superHeavy: token({
    light:
      '0px 0px 8px 0px color(display-p3 0 0 0 / 0.161), 0px 8px 64px -16px color(display-p3 0 0 0 / 0.478), 0px 24px 56px -16px color(display-p3 0 0 0 / 0.078)',
    dark: '2px 4px 16px 0px rgba(0, 0, 0, 0.12), 0px 2px 4px 0px rgba(0, 0, 0, 0.04)',
  }),
};
