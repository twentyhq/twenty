import { HotkeyScope } from '../../../utilities/hotkey/types/HotkeyScope';
import { createComponentState } from '../../../utilities/state/component-state/utils/createComponentState';

export const dropdownHotkeyComponentState = createComponentState<
  HotkeyScope | null | undefined
>({
  key: 'dropdownHotkeyComponentState',
  defaultValue: null,
});
