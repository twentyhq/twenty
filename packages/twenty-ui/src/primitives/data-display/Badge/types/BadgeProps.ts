import { type useRender } from '@base-ui/react/use-render';

import { type BadgeColor } from './BadgeColor';
import { type BadgeShape } from './BadgeShape';
import { type BadgeSize } from './BadgeSize';

export type BadgeProps = Omit<useRender.ComponentProps<'span'>, 'color'> & {
  size?: BadgeSize;
  color?: BadgeColor;
  shape?: BadgeShape;
};
