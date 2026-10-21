import { type CSSProperties, type ReactElement, type ReactNode } from 'react';

import { type TooltipPopupProps } from './TooltipPopupProps';
import { type TooltipPortalProps } from './TooltipPortalProps';
import { type TooltipPositionerProps } from './TooltipPositionerProps';
import { type TooltipRootProps } from './TooltipRootProps';
import { type TooltipTriggerProps } from './TooltipTriggerProps';

export type TooltipProps<TPayload = unknown> = Omit<
  TooltipPopupProps,
  'children' | 'content'
> &
  Omit<TooltipRootProps<TPayload>, 'children'> &
  Pick<TooltipTriggerProps<TPayload>, 'delay' | 'closeDelay' | 'closeOnClick'> &
  Pick<
    TooltipPositionerProps,
    | 'side'
    | 'align'
    | 'anchor'
    | 'sideOffset'
    | 'alignOffset'
    | 'positionMethod'
    | 'collisionBoundary'
    | 'collisionPadding'
    | 'collisionAvoidance'
    | 'sticky'
    | 'arrowPadding'
    | 'disableAnchorTracking'
  > & {
    content: TooltipRootProps<TPayload>['children'];
    children: ReactElement;
    description?: ReactNode;
    startIcon?: ReactNode;
    arrow?: boolean;
    maxWidth?: CSSProperties['maxWidth'];
    container?: TooltipPortalProps['container'];
    keepMounted?: boolean;
    triggerProps?: TooltipTriggerProps<TPayload>;
    positionerProps?: TooltipPositionerProps;
    portalProps?: TooltipPortalProps;
  };
