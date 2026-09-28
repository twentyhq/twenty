import { type Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { type ReactElement, type ReactNode } from 'react';

import { type TooltipPopupProps } from './TooltipPopupProps';

export type TooltipProps = Omit<TooltipPopupProps, 'children' | 'content'> &
  Omit<TooltipPrimitive.Root.Props, 'children' | 'handle'> &
  Pick<
    TooltipPrimitive.Trigger.Props,
    'delay' | 'closeDelay' | 'closeOnClick'
  > & {
    content: ReactNode;
    children: ReactElement;
  };
