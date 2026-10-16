import { type Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { type CSSProperties } from 'react';

export type TooltipPopupProps = TooltipPrimitive.Popup.Props & {
  withExitAnimation?: boolean;
  maxWidth?: CSSProperties['maxWidth'];
};
