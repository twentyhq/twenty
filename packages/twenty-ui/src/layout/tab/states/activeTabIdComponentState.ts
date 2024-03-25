import { createComponentState } from 'src/utilities/state/component-state/utils/createComponentState';

export const activeTabIdComponentState = createComponentState<string | null>({
  key: 'activeTabIdComponentState',
  defaultValue: null,
});
