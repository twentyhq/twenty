import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

import { type CalloutColor } from './CalloutColor';
import { type CalloutState } from './CalloutState';
import { type CalloutStatus } from './CalloutStatus';
import { type CalloutVariant } from './CalloutVariant';

export type CalloutProps = Omit<
  useRender.ComponentProps<'div', CalloutState>,
  'title' | 'color' | 'children'
> & {
  status?: CalloutStatus;
  variant?: CalloutVariant;
  color?: CalloutColor;
  title: ReactNode;
  description?: ReactNode;
  fullWidth?: boolean;
  icon?: ReactNode;
  action?: ReactNode;
  closeLabel?: string;
  onDismiss?: () => void;
};
