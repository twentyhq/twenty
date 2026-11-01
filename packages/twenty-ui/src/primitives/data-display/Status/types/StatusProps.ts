import { type useRender } from '@base-ui/react/use-render';

import { type ThemeColor } from '@ui/theme';

import { type StatusState } from './StatusState';

export type StatusProps = Omit<
  useRender.ComponentProps<'span', StatusState>,
  'color'
> &
  Partial<StatusState> & {
    color: ThemeColor;
  };
