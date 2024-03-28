import { createState } from 'src/utilities';

export const rightDrawerCloseEventState = createState<Event | null>({
  key: 'rightDrawerCloseEventState',
  defaultValue: null,
});
