import { createState } from 'src/utilities';

export const colorSchemeState = createState<'System' | 'Light' | 'Dark'>({
  key: 'ui/theme/colorSchemeState',
  defaultValue: 'System',
});
