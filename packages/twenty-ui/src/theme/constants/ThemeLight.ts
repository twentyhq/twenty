import { css } from '@emotion/react';
import {
  ADAPTIVE_COLORS_LIGHT,
  ADAPTIVE_COLORS_LIGHT_CSS,
} from '@ui/theme/constants/AdaptiveColorsLight';
import { BLUR_LIGHT, BLUR_LIGHT_CSS } from '@ui/theme/constants/BlurLight';
import {
  ILLUSTRATION_ICON_LIGHT,
  ILLUSTRATION_ICON_LIGHT_CSS,
} from '@ui/theme/constants/IllustrationIconLight';
import {
  SNACK_BAR_LIGHT,
  SNACK_BAR_LIGHT_CSS,
} from '@ui/theme/constants/SnackBarLight';
import { ACCENT_LIGHT, ACCENT_LIGHT_CSS } from './AccentLight';
import { BACKGROUND_LIGHT, BACKGROUND_LIGHT_CSS } from './BackgroundLight';
import { BORDER_LIGHT, BORDER_LIGHT_CSS } from './BorderLight';
import { BOX_SHADOW_LIGHT, BOX_SHADOW_LIGHT_CSS } from './BoxShadowLight';
import { CODE_LIGHT, CODE_LIGHT_CSS } from './CodeLight';
import { FONT_LIGHT, FONT_LIGHT_CSS } from './FontLight';
import { TAG_LIGHT, TAG_LIGHT_CSS } from './TagLight';
import { THEME_COMMON, THEME_COMMON_CSS } from './ThemeCommon';

export const THEME_LIGHT = {
  ...THEME_COMMON,
  ...{
    accent: ACCENT_LIGHT,
    background: BACKGROUND_LIGHT,
    blur: BLUR_LIGHT,
    border: BORDER_LIGHT,
    boxShadow: BOX_SHADOW_LIGHT,
    font: FONT_LIGHT,
    name: 'light',
    snackBar: SNACK_BAR_LIGHT,
    tag: TAG_LIGHT,
    code: CODE_LIGHT,
    IllustrationIcon: ILLUSTRATION_ICON_LIGHT,
    adaptiveColors: ADAPTIVE_COLORS_LIGHT,
  },
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const THEME_LIGHT_CSS = css`
  ${THEME_COMMON_CSS}
  ${ACCENT_LIGHT_CSS}
  ${BACKGROUND_LIGHT_CSS}
  ${BLUR_LIGHT_CSS}
  ${BORDER_LIGHT_CSS}
  ${BOX_SHADOW_LIGHT_CSS}
  ${CODE_LIGHT_CSS}
  ${FONT_LIGHT_CSS}
  ${TAG_LIGHT_CSS}
  ${ILLUSTRATION_ICON_LIGHT_CSS}
  ${ADAPTIVE_COLORS_LIGHT_CSS}
  ${SNACK_BAR_LIGHT_CSS}
`;
