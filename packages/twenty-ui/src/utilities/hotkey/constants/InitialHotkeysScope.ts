import { AppHotkeyScope } from '../types/AppHotkeyScope';
import { HotkeyScope } from '../types/HotkeyScope';

export const INITIAL_HOTKEYS_SCOPE: HotkeyScope = {
  scope: AppHotkeyScope.App,
  customScopes: {
    commandMenu: true,
    goto: true,
    keyboardShortcutMenu: true,
  },
};
