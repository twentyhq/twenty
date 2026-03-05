import { type ThemeColor } from '@ui/theme-constants';

export type JsonNodeHighlighting =
  | Extract<ThemeColor, 'blue' | 'red'>
  | 'partial-blue';
