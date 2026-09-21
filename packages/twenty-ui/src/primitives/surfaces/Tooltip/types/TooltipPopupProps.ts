import { type Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { type CSSProperties } from 'react';

import { type TooltipAlign } from './TooltipAlign';
import { type TooltipSide } from './TooltipSide';

export type TooltipPopupProps = TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    | 'anchor'
    | 'sideOffset'
    | 'alignOffset'
    | 'positionMethod'
    | 'collisionBoundary'
    | 'collisionPadding'
    | 'collisionAvoidance'
    | 'sticky'
    | 'disableAnchorTracking'
  > & {
    side?: TooltipSide;
    align?: TooltipAlign;
    arrow?: boolean;
    maxWidth?: CSSProperties['maxWidth'];
    container?: TooltipPrimitive.Portal.Props['container'];
    keepMounted?: boolean;
  };
