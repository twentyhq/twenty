import { createState } from '../../../state/utils/createState';

export const internalHotkeysEnabledScopesState = createState<string[]>({
  key: 'internalHotkeysEnabledScopesState',
  defaultValue: [],
});
