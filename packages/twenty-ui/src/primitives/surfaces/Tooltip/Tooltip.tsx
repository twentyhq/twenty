import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

import { TooltipComponent } from './internal/TooltipComponent';
import { TooltipContent } from './internal/TooltipContent';
import { TooltipPopup } from './internal/TooltipPopup';

export const Tooltip = Object.assign(TooltipComponent, {
  Root: TooltipPrimitive.Root,
  Trigger: TooltipPrimitive.Trigger,
  Popup: TooltipPopup,
  Content: TooltipContent,
  Provider: TooltipPrimitive.Provider,
  createHandle: TooltipPrimitive.createHandle,
});
