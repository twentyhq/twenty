export type CanvasThemeColors = {
  pageBackground: string;
  bodyBackground: string;
  textColor: string;
  borderColor: string;
};

export type CanvasTheme = CanvasThemeColors & {
  pagePadding: string;
  textAlign: 'left' | 'center' | 'right';
  width: string;
  padding: string;
  cornerRadius: string;
  borderWidth: string;
  dark: CanvasThemeColors;
};

export type CanvasThemeColorScheme = 'light' | 'dark';

export type CanvasThemeStringProperty = Exclude<keyof CanvasTheme, 'dark'>;

export const CANVAS_THEME_COLOR_PROPERTIES = [
  'pageBackground',
  'bodyBackground',
  'textColor',
  'borderColor',
] as const satisfies readonly (keyof CanvasThemeColors)[];

const WEBSITE_WHITE = '#ffffff';
const WEBSITE_BLACK = '#1c1c1c';
const WEBSITE_SILVER = '#dbdbdb';
const WEBSITE_GRAPHITE = '#424242';

const APP_DARK_SURFACE = '#171717';

export const CANVAS_THEME_DARK_DEFAULTS: CanvasThemeColors = {
  pageBackground: APP_DARK_SURFACE,
  bodyBackground: '',
  textColor: WEBSITE_WHITE,
  borderColor: WEBSITE_GRAPHITE,
};

export const CANVAS_THEME_DEFAULTS: CanvasTheme = {
  pageBackground: WEBSITE_WHITE,
  pagePadding: '24px',
  textAlign: 'left',
  bodyBackground: '',
  textColor: WEBSITE_BLACK,
  width: '600px',
  padding: '24px',
  cornerRadius: '0px',
  borderWidth: '0px',
  borderColor: WEBSITE_SILVER,
  dark: CANVAS_THEME_DARK_DEFAULTS,
};
