import { STATIC_COLOR_TOKENS } from './color/static';
import { token } from './token';

export const TOOLTIP_TOKENS = {
  background: STATIC_COLOR_TOKENS.black11,
  color: STATIC_COLOR_TOKENS.white12,
  descriptionColor: token('color(display-p3 1 1 1 / 0.64)'),
};
