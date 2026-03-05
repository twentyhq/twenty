import { type ThemeColor } from '@ui/theme';

export type JsonNodeHighlighting =
  | Extract<ThemeColor, 'blue' | 'red'>
  | 'partial-blue';
