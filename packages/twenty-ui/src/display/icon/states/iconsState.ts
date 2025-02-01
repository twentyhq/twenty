import { IconComponent } from '@ui/display/icon/types/IconComponent';
import { createState } from 'twenty-shared';

export const iconsState = createState<Record<string, IconComponent>>({
  key: 'iconsState',
  defaultValue: {},
});
