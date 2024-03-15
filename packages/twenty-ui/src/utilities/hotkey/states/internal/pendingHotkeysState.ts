import { Keys } from 'react-hotkeys-hook/dist/types';

import { createState } from '../../../state/utils/createState';

export const pendingHotkeyState = createState<Keys | null>({
  key: 'pendingHotkeyState',
  defaultValue: null,
});
