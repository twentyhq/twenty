import { createState } from 'src/utilities';

export const isRightDrawerOpenState = createState<boolean>({
  key: 'ui/layout/is-right-drawer-open',
  defaultValue: false,
});
