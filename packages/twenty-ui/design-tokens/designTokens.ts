import { ACCENT_TOKENS } from './accent';
import { ANIMATION_TOKENS } from './animation';
import { BACKGROUND_TOKENS } from './background';
import { BLUR_TOKENS } from './blur';
import { BORDER_TOKENS } from './border';
import { BOX_SHADOW_TOKENS } from './boxShadow';
import { BUTTONS_TOKENS } from './buttons';
import { CODE_TOKENS } from './code';
import { COLOR_TOKENS } from './color';
import { FONT_TOKENS } from './font';
import { GRAY_SCALE_TOKENS } from './grayScale';
import { ICON_TOKENS } from './icon';
import { ILLUSTRATION_ICON_TOKENS } from './illustrationIcon';
import { MODAL_TOKENS } from './modal';
import { SNACK_BAR_TOKENS } from './snackBar';
import { SPACING_TOKENS } from './spacing';
import { TABLE_TOKENS } from './table';
import { TAG_TOKENS } from './tag';
import { TEXT_TOKENS } from './text';
import { token } from './token';
import { type DesignTokenNode } from './types/DesignTokenNode';

export const DESIGN_TOKENS: DesignTokenNode = {
  icon: ICON_TOKENS,
  modal: MODAL_TOKENS,
  text: TEXT_TOKENS,
  animation: ANIMATION_TOKENS,
  spacingMultiplicator: token('4', { unit: 'number' }),
  spacing: SPACING_TOKENS,
  betweenSiblingsGap: token('2px'),
  table: TABLE_TOKENS,
  sidePanelWidth: token('500px'),
  clickableElementBackgroundTransition: token('background 0.1s ease'),
  lastLayerZIndex: token('2147483647', { unit: 'number' }),
  buttons: BUTTONS_TOKENS,
  accent: ACCENT_TOKENS,
  background: BACKGROUND_TOKENS,
  blur: BLUR_TOKENS,
  border: BORDER_TOKENS,
  boxShadow: BOX_SHADOW_TOKENS,
  font: FONT_TOKENS,
  name: token({ light: 'light', dark: 'dark' }),
  snackBar: SNACK_BAR_TOKENS,
  tag: TAG_TOKENS,
  code: CODE_TOKENS,
  IllustrationIcon: ILLUSTRATION_ICON_TOKENS,
  grayScale: GRAY_SCALE_TOKENS,
  color: COLOR_TOKENS,
};
