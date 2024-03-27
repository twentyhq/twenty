import { createComponentState } from 'src/utilities/state/component-state/utils/createComponentState';

export const dropdownWidthComponentState = createComponentState<
  number | undefined
>({
  key: 'dropdownWidthComponentState',
  defaultValue: 160,
});
