// Document-level styling for campaign emails, stored as the `emailTheme`
// attribute on the TipTap doc node. The composer renders it as a centered
// email page; the server renders it as a Body + centered Container wrapper.
// Values are literal CSS because emails cannot reference theme variables.
export type EmailTheme = {
  pageBackground: string;
  bodyBackground: string;
  textColor: string;
  width: string;
  padding: string;
  cornerRadius: string;
  border: string;
};

export const EMAIL_THEME_DEFAULTS: EmailTheme = {
  pageBackground: '#f4f4f5',
  bodyBackground: '#ffffff',
  textColor: '#18181b',
  width: '600px',
  padding: '24px',
  cornerRadius: '8px',
  border: 'none',
};

export const isEmailTheme = (value: unknown): value is EmailTheme =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as EmailTheme).bodyBackground === 'string' &&
  typeof (value as EmailTheme).width === 'string';
