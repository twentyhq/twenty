import { THEME_DARK } from './constants/ThemeDark';
import { THEME_LIGHT } from './constants/ThemeLight';

type TwentyUITheme = typeof THEME_DARK;

export type { TwentyUITheme };
export { THEME_DARK as darkTheme, THEME_LIGHT as lightTheme };
