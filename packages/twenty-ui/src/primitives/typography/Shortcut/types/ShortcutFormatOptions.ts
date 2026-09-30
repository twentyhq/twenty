import { type ShortcutDefinition } from './ShortcutDefinition';

export type ShortcutFormatOptions = {
  shortcut: ShortcutDefinition;
  platform?: 'mac' | 'other';
  sequenceJoinLabel?: string;
  combinationSeparator?: string;
};
