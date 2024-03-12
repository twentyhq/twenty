import { ACCENT_LIGHT } from './AccentLight';
import { BACKGROUND_LIGHT } from './BackgroundLight';
import { BORDER_LIGHT } from './BorderLight';
import { BOX_SHADOW_LIGHT } from './BoxShadowLight';
import { FONT_LIGHT } from './FontLight';
import { TAG_LIGHT } from './TagLight';
import { THEME_COMMON } from './ThemeCommon';

export const THEME_LIGHT = {
  ...THEME_COMMON,
  ...{
    accent: ACCENT_LIGHT,
    background: BACKGROUND_LIGHT,
    border: BORDER_LIGHT,
    tag: TAG_LIGHT,
    boxShadow: BOX_SHADOW_LIGHT,
    font: FONT_LIGHT,
    name: 'light',
  },
};
