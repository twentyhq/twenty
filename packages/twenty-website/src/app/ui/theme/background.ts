import { Color, rgba } from './colors';

export const Background = {
  primary: Color.white,
  secondary: Color.gray10,
  tertiary: Color.gray20,
  transparent: {
    strong: rgba(Color.gray60, 0.16),
    medium: rgba(Color.gray60, 0.08),
    light: rgba(Color.gray60, 0.06),
    lighter: rgba(Color.gray60, 0.04),
  },
};
