import { createState } from 'src/utilities';

export const isRightDrawerExpandedState = createState<boolean>({
  key: 'isRightDrawerExpandedState',
  defaultValue: false,
});
