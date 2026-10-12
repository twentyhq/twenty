import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

import { TooltipArrow } from './internal/TooltipArrow';
import { TooltipComponent } from './internal/TooltipComponent';
import { TooltipPopup } from './internal/TooltipPopup';
import { TooltipPortal } from './internal/TooltipPortal';
import { TooltipPositioner } from './internal/TooltipPositioner';

export const Tooltip = Object.assign(TooltipComponent, {
  Root: TooltipPrimitive.Root,
  Trigger: TooltipPrimitive.Trigger,
  Portal: TooltipPortal,
  Positioner: TooltipPositioner,
  Popup: TooltipPopup,
  Arrow: TooltipArrow,
  Viewport: TooltipPrimitive.Viewport,
  Provider: TooltipPrimitive.Provider,
  Handle: TooltipPrimitive.Handle,
  createHandle: TooltipPrimitive.createHandle,
});
