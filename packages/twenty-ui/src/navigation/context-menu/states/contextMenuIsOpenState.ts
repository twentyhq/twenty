import { createState } from 'src/utilities';

export const contextMenuIsOpenState = createState<boolean>({
  key: 'contextMenuIsOpenState',
  defaultValue: false,
});
