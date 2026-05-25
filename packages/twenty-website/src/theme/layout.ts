export const layout = {
  readingNarrow: '720px',
  readingWide: '800px',
  editorial: '921px',
} as const;

export type LayoutToken = keyof typeof layout;
