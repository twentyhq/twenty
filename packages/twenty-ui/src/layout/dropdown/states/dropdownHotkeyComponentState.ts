import { HotkeyScope } from 'src/utilities/hotkey/types/HotkeyScope';
import { createComponentState } from 'src/utilities/state/component-state/utils/createComponentState';

export const dropdownHotkeyComponentState = createComponentState<
  HotkeyScope | null | undefined
>({
  key: 'dropdownHotkeyComponentState',
  defaultValue: null,
});
