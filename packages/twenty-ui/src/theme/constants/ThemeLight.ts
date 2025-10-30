import { BLUR_LIGHT } from '@ui/theme/constants/BlurLight';
import { COLOR_LIGHT } from '@ui/theme/constants/ColorsLight';
import { GRAY_SCALE_LIGHT } from '@ui/theme/constants/GrayScaleLight';
import { ILLUSTRATION_ICON_LIGHT } from '@ui/theme/constants/IllustrationIconLight';
import { SNACK_BAR_LIGHT } from '@ui/theme/constants/SnackBarLight';
import { ACCENT_LIGHT } from './AccentLight';
import { BACKGROUND_LIGHT } from './BackgroundLight';
import { BORDER_LIGHT } from './BorderLight';
import { BOX_SHADOW_LIGHT } from './BoxShadowLight';
import { CODE_LIGHT } from './CodeLight';
import { FONT_LIGHT } from './FontLight';
import { TAG_LIGHT } from './TagLight';
import { THEME_COMMON } from './ThemeCommon';

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
    grayScale: GRAY_SCALE_LIGHT,
    color: COLOR_LIGHT,
  },
};
