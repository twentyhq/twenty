import { getShortcutPresentation } from './internal/getShortcutPresentation';
import { type ShortcutFormatOptions } from './types/ShortcutFormatOptions';

export const formatShortcut = (options: ShortcutFormatOptions) =>
  getShortcutPresentation(options).text;
