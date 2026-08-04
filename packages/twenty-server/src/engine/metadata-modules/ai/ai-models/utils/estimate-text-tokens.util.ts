const CHARS_PER_TOKEN = 4;

export const estimateTextTokens = (...texts: string[]): number =>
  Math.ceil(
    texts.reduce((total, text) => total + text.length, 0) / CHARS_PER_TOKEN,
  );
