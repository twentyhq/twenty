import { createComponentState } from 'src/utilities/state/component-state/utils/createComponentState';

export const isDropdownOpenComponentState = createComponentState<boolean>({
  key: 'isDropdownOpenComponentState',
  defaultValue: false,
});
