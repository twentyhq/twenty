import { BLUR_DARK } from '@ui/theme/constants/BlurDark';
import { ILLUSTRATION_ICON_DARK } from '@ui/theme/constants/IllustrationIconDark';
import {
  COLOR_DARK,
  GRAY_SCALE_DARK,
  SNACK_BAR_DARK,
  type ThemeType,
} from '..';
import { ACCENT_DARK } from './AccentDark';
import { BACKGROUND_DARK } from './BackgroundDark';
import { BORDER_DARK } from './BorderDark';
import { BOX_SHADOW_DARK } from './BoxShadowDark';
import { CODE_DARK } from './CodeDark';
import { FONT_DARK } from './FontDark';
import { TAG_DARK } from './TagDark';
import { THEME_COMMON } from './ThemeCommon';

export const THEME_DARK: ThemeType = {
  ...THEME_COMMON,
  ...{
    accent: ACCENT_DARK,
    background: BACKGROUND_DARK,
    blur: BLUR_DARK,
    border: BORDER_DARK,
    boxShadow: BOX_SHADOW_DARK,
    font: FONT_DARK,
    name: 'dark',
    snackBar: SNACK_BAR_DARK,
    tag: TAG_DARK,
    code: CODE_DARK,
    IllustrationIcon: ILLUSTRATION_ICON_DARK,
    grayScale: GRAY_SCALE_DARK,
    color: COLOR_DARK,
  },
};
