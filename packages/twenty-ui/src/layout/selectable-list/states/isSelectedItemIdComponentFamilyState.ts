import { createComponentFamilyState } from '../../../utilities/state/component-state/utils/createComponentFamilyState';

export const isSelectedItemIdComponentFamilyState = createComponentFamilyState<
  boolean,
  string
>({
  key: 'isSelectedItemIdComponentFamilyState',
  defaultValue: false,
});
