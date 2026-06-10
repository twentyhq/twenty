export type FontFamilyToken = 'sans' | 'serif' | 'mono';

// The css variables are bound by next/font in app/layout.tsx, which requires
// literal option values — keep these names in sync with the layout.
const FAMILY_STACK: Record<FontFamilyToken, string> = {
  sans: 'var(--font-sans), sans-serif',
  serif: 'var(--font-serif), serif',
  mono: 'var(--font-mono), monospace',
};

export const fontFamily = (token: FontFamilyToken): string =>
  FAMILY_STACK[token];
