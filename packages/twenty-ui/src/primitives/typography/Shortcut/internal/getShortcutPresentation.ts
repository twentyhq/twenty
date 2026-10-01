import { isNonEmptyArray, isString } from '@sniptt/guards';

import { isDefined } from '@ui/utilities/utils/isDefined';
import { getUserDevice } from '@ui/utilities/device/getUserDevice';

import { type ShortcutDefinition } from '../types/ShortcutDefinition';
import { type ShortcutFormatOptions } from '../types/ShortcutFormatOptions';

const ACCESSIBLE_KEY_LABELS = new Map<string, string>([
  ['⌘', 'Command'],
  ['⌥', 'Option'],
  ['⇧', 'Shift'],
  ['⌃', 'Control'],
  ['Ctrl', 'Control'],
  ['⏎', 'Enter'],
  ['↵', 'Enter'],
  ['⌫', 'Backspace'],
  ['↑', 'Arrow up'],
  ['↓', 'Arrow down'],
  ['←', 'Arrow left'],
  ['→', 'Arrow right'],
  ['esc', 'Escape'],
]);

const isShortcutCombination = (
  shortcut: ShortcutDefinition,
): shortcut is readonly string[] => shortcut.every(isString);

export const getShortcutPresentation = ({
  shortcut,
  platform,
  sequenceJoinLabel = 'then',
  combinationSeparator,
}: ShortcutFormatOptions) => {
  const device = getUserDevice();
  const isMac =
    platform === 'mac' ||
    (!isDefined(platform) && (device === 'mac' || device === 'ios'));
  const keySymbols = new Map<string, string>([
    ['Mod', isMac ? '⌘' : 'Ctrl'],
    ['CommandOrControl', isMac ? '⌘' : 'Ctrl'],
    ['Command', '⌘'],
    ['Control', 'Ctrl'],
    ['Alt', isMac ? '⌥' : 'Alt'],
    ['Enter', '⏎'],
  ]);
  const steps = isShortcutCombination(shortcut) ? [shortcut] : shortcut;
  const groups = steps
    .filter(isNonEmptyArray)
    .map((keys) => keys.map((key) => keySymbols.get(key) ?? key));
  const separator = combinationSeparator ?? (isMac ? '' : ' ');
  const sequenceSeparator = ` ${sequenceJoinLabel} `;

  return {
    groups,
    separator,
    sequenceJoinLabel,
    text: groups.map((keys) => keys.join(separator)).join(sequenceSeparator),
    accessibleLabel: groups
      .map((keys) =>
        keys.map((key) => ACCESSIBLE_KEY_LABELS.get(key) ?? key).join(' + '),
      )
      .join(sequenceSeparator),
  };
};
