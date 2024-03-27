import { createState } from '../../state/utils/createState';

export const lockedListenerIdState = createState<string | null>({
  key: 'lockedListenerIdState',
  defaultValue: null,
});
