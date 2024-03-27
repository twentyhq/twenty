import { createComponentState } from 'src/utilities/state/component-state/utils/createComponentState';

export const selectableItemIdsComponentState = createComponentState<string[][]>(
  {
    key: 'selectableItemIdsComponentState',
    defaultValue: [[]],
  },
);
