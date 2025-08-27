import { css } from '@linaria/core';
import { ACCENT_LIGHT_CSS } from '@ui/theme/constants/AccentLight';
import { ADAPTIVE_COLORS_LIGHT_CSS } from '@ui/theme/constants/AdaptiveColorsLight';
import { BACKGROUND_LIGHT_CSS } from '@ui/theme/constants/BackgroundLight';
import { BLUR_LIGHT_CSS } from '@ui/theme/constants/BlurLight';
import { BORDER_LIGHT_CSS } from '@ui/theme/constants/BorderLight';
import { BOX_SHADOW_LIGHT_CSS } from '@ui/theme/constants/BoxShadowLight';
import { CODE_LIGHT_CSS } from '@ui/theme/constants/CodeLight';
import { FONT_LIGHT_CSS } from '@ui/theme/constants/FontLight';
import { ILLUSTRATION_ICON_LIGHT_CSS } from '@ui/theme/constants/IllustrationIconLight';
import { SNACK_BAR_LIGHT_CSS } from '@ui/theme/constants/SnackBarLight';
import { TAG_LIGHT_CSS } from '@ui/theme/constants/TagLight';
import { THEME_COMMON_CSS } from '@ui/theme/constants/ThemeCommon';

export const THEME_LIGHT_CSS = css`
  :global() {
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
  }
`;
