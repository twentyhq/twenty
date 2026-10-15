import { type Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

export type TooltipPopupProps = TooltipPrimitive.Popup.Props & {
  withExitAnimation?: boolean;
};
