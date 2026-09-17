const MAX_DISPLAY_NAME_LENGTH = 80;

// Names end up inside prompt markup, so anything that could open or close a
// tag, break a line, or smuggle instructions is stripped before use.
export const sanitizeModelDisplayName = (name: string): string =>
  name
    .replace(/[<>]/g, '')
    .replace(/[\p{Cc}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_DISPLAY_NAME_LENGTH);
