import { createState } from 'src/utilities';

import { ContextMenuEntry } from '../types/ContextMenuEntry';

export const contextMenuEntriesState = createState<ContextMenuEntry[]>({
  key: 'contextMenuEntriesState',
  defaultValue: [],
});
