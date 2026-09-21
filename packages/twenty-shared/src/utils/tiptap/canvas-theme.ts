export type CanvasTheme = {
  pageBackground: string;
  pagePadding: string;
  textAlign: 'left' | 'center' | 'right';
  bodyBackground: string;
  textColor: string;
  width: string;
  padding: string;
  cornerRadius: string;
  borderWidth: string;
  borderColor: string;
};

export const CANVAS_THEME_DEFAULTS: CanvasTheme = {
  pageBackground: '#ffffff',
  pagePadding: '24px',
  textAlign: 'left',
  bodyBackground: '',
  textColor: '#18181b',
  width: '600px',
  padding: '24px',
  cornerRadius: '0px',
  borderWidth: '0px',
  borderColor: '',
};
