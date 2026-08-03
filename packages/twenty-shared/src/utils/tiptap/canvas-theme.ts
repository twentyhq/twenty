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

export const CANVAS_THEME_DEFAULTS: CanvasTheme = {
  pageBackground: '#f4f4f5',
  pagePadding: '24px',
  textAlign: 'left',
  bodyBackground: '#ffffff',
  textColor: '#18181b',
  width: '600px',
  padding: '24px',
  cornerRadius: '8px',
  borderWidth: '0px',
  borderColor: '#000000',
};
