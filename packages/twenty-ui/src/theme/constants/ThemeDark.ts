import { css } from '@emotion/react';
import {
  ADAPTIVE_COLORS_DARK,
  ADAPTIVE_COLORS_DARK_CSS,
} from '@ui/theme/constants/AdaptiveColorsDark';
import { BLUR_DARK, BLUR_DARK_CSS } from '@ui/theme/constants/BlurDark';
import {
  ILLUSTRATION_ICON_DARK,
  ILLUSTRATION_ICON_DARK_CSS,
} from '@ui/theme/constants/IllustrationIconDark';
import { SNACK_BAR_DARK_CSS } from '@ui/theme/constants/SnackBarDark';
import { SNACK_BAR_DARK, type ThemeType } from '..';
import { ACCENT_DARK, ACCENT_DARK_CSS } from './AccentDark';
import { BACKGROUND_DARK, BACKGROUND_DARK_CSS } from './BackgroundDark';
import { BORDER_DARK, BORDER_DARK_CSS } from './BorderDark';
import { BOX_SHADOW_DARK, BOX_SHADOW_DARK_CSS } from './BoxShadowDark';
import { CODE_DARK, CODE_DARK_CSS } from './CodeDark';
import { FONT_DARK, FONT_DARK_CSS } from './FontDark';
import { TAG_DARK, TAG_DARK_CSS } from './TagDark';
import { THEME_COMMON, THEME_COMMON_CSS } from './ThemeCommon';

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
    adaptiveColors: ADAPTIVE_COLORS_DARK,
  },
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const THEME_DARK_CSS = css`
  ${THEME_COMMON_CSS}
  ${ACCENT_DARK_CSS}
  ${BACKGROUND_DARK_CSS}
  ${BLUR_DARK_CSS}
  ${BORDER_DARK_CSS}
  ${BOX_SHADOW_DARK_CSS}
  ${CODE_DARK_CSS}
  ${FONT_DARK_CSS}
  ${ILLUSTRATION_ICON_DARK_CSS}
  ${SNACK_BAR_DARK_CSS}
  ${TAG_DARK_CSS}
  ${ADAPTIVE_COLORS_DARK_CSS}
`;
