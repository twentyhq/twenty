import { createState } from 'src/utilities';

import { RightDrawerPages } from '../types/RightDrawerPages';

export const rightDrawerPageState = createState<RightDrawerPages | null>({
  key: 'ui/layout/right-drawer-page',
  defaultValue: null,
});
