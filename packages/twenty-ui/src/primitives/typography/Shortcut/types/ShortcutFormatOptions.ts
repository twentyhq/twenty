import { type ShortcutDefinition } from './ShortcutDefinition';

export type ShortcutFormatOptions = {
  shortcut: ShortcutDefinition;
  platform?: 'mac' | 'other';
  sequenceJoinLabel?: string;
  combinationSeparator?: string;
  accessibleKeyLabels?: Readonly<Record<string, string>>;
};
