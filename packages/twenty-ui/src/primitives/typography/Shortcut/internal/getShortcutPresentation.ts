import { isNonEmptyArray, isString } from '@sniptt/guards';

import { isDefined } from '@ui/utilities/utils/isDefined';
import { getUserDevice } from '@ui/utilities/device/getUserDevice';

import { type ShortcutDefinition } from '../types/ShortcutDefinition';
import { type ShortcutFormatOptions } from '../types/ShortcutFormatOptions';
import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

const ACCESSIBLE_KEY_LABELS = new Map<string, string>(
  doNotTranslate([
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
  ]),
);

const isShortcutCombination = (
  shortcut: ShortcutDefinition,
): shortcut is readonly string[] => shortcut.every(isString);

export const getShortcutPresentation = ({
  shortcut,
  platform,
  sequenceJoinLabel = 'then',
  combinationSeparator,
  accessibleKeyLabels,
}: ShortcutFormatOptions) => {
  const device = getUserDevice();
  const isMac =
    platform === 'mac' ||
    (!isDefined(platform) && (device === 'mac' || device === 'ios'));
  const keySymbols = new Map<string, string>([
    [doNotTranslate('Mod'), isMac ? '⌘' : doNotTranslate('Ctrl')],
    [doNotTranslate('CommandOrControl'), isMac ? '⌘' : doNotTranslate('Ctrl')],
    [doNotTranslate('Command'), '⌘'],
    doNotTranslate(['Control', 'Ctrl']),
    [doNotTranslate('Alt'), isMac ? '⌥' : doNotTranslate('Alt')],
    [doNotTranslate('Enter'), '⏎'],
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
        keys
          .map(
            (key) =>
              accessibleKeyLabels?.[key] ??
              ACCESSIBLE_KEY_LABELS.get(key) ??
              key,
          )
          .join(' + '),
      )
      .join(sequenceSeparator),
  };
};
