// Document-level styling for campaign emails, stored as the `emailTheme`
// attribute on the TipTap doc node. The composer renders it as a centered
// email page; the server renders it as a Body + centered Container wrapper.
// Values are literal CSS because emails cannot reference theme variables.
export type EmailTheme = {
  pageBackground: string;
  pagePadding: string;
  bodyAlign: 'left' | 'center' | 'right';
  bodyBackground: string;
  textColor: string;
  width: string;
  padding: string;
  cornerRadius: string;
  borderWidth: string;
  borderColor: string;
};

export const EMAIL_THEME_DEFAULTS: EmailTheme = {
  pageBackground: '#f4f4f5',
  pagePadding: '24px',
  bodyAlign: 'center',
  bodyBackground: '#ffffff',
  textColor: '#18181b',
  width: '600px',
  padding: '24px',
  cornerRadius: '8px',
  borderWidth: '0px',
  borderColor: '#000000',
};

export const isEmailTheme = (value: unknown): value is Partial<EmailTheme> =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as EmailTheme).bodyBackground === 'string' &&
  typeof (value as EmailTheme).width === 'string';

// Stored themes may predate newly added keys; resolving against the defaults
// is how the theme shape evolves without migrating existing documents.
export const resolveEmailTheme = (value: unknown): EmailTheme | null =>
  isEmailTheme(value) ? { ...EMAIL_THEME_DEFAULTS, ...value } : null;
