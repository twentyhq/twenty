// Document-level styling for campaign emails, stored as the `canvasTheme`
// attribute on the TipTap doc node. The composer renders it as a centered
// email page; the server renders it as a Body + centered Container wrapper.
// Values are literal CSS because emails cannot reference theme variables.
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

// Empty string means "no value": no body background, no border colour.
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
