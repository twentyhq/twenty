import { createState } from 'src/utilities';

export const actionBarOpenState = createState<boolean>({
  key: 'actionBarOpenState',
  defaultValue: false,
});
