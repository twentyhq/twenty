import { type useRender } from '@base-ui/react/use-render';

import { type ThemeColor } from '@ui/theme';

export type StatusProps = Omit<useRender.ComponentProps<'span'>, 'color'> & {
  color: ThemeColor;
  weight?: 'regular' | 'medium';
  disabled?: boolean;
  nativeButton?: boolean;
  loading?: boolean;
};
