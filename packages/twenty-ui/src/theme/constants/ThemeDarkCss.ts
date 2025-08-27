import { css } from '@linaria/core';
import { ACCENT_DARK_CSS } from '@ui/theme/constants/AccentDark';
import { ADAPTIVE_COLORS_DARK_CSS } from '@ui/theme/constants/AdaptiveColorsDark';
import { BACKGROUND_DARK_CSS } from '@ui/theme/constants/BackgroundDark';
import { BLUR_DARK_CSS } from '@ui/theme/constants/BlurDark';
import { BORDER_DARK_CSS } from '@ui/theme/constants/BorderDark';
import { BOX_SHADOW_DARK_CSS } from '@ui/theme/constants/BoxShadowDark';
import { CODE_DARK_CSS } from '@ui/theme/constants/CodeDark';
import { FONT_DARK_CSS } from '@ui/theme/constants/FontDark';
import { ILLUSTRATION_ICON_DARK_CSS } from '@ui/theme/constants/IllustrationIconDark';
import { SNACK_BAR_DARK_CSS } from '@ui/theme/constants/SnackBarDark';
import { TAG_DARK_CSS } from '@ui/theme/constants/TagDark';
import { THEME_COMMON_CSS } from '@ui/theme/constants/ThemeCommon';

export const THEME_DARK_CSS = css`
  :global() {
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
  }
`;
