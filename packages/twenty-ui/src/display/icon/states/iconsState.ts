import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { createState } from '@ui/utilities/state/utils/createState';

export const iconsState = createState<Record<string, IconComponent>>({
  key: 'iconsState',
  defaultValue: {},
});
