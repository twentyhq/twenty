import { createState } from '../../../utilities/state/utils/createState';
import { IconComponent } from '../types/IconComponent';

export const iconsState = createState<Record<string, IconComponent>>({
  key: 'iconsState',
  defaultValue: {},
});
