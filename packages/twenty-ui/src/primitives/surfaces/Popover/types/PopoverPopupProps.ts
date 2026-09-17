import { type Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { type PopoverAlign } from './PopoverAlign';
import { type PopoverSide } from './PopoverSide';

export type PopoverPopupProps = PopoverPrimitive.Popup.Props & {
  /** Side of the anchor the popup is placed on. */
  side?: PopoverSide;
  /** Alignment of the popup along the anchor. */
  align?: PopoverAlign;
  /** Distance in pixels between the anchor and the popup. */
  sideOffset?: number;
  /** Offset in pixels along the alignment axis. */
  alignOffset?: number;
  /** Shows an arrow pointing at the anchor. */
  arrow?: boolean;
  /** Element or position the popup is anchored to. Defaults to the trigger. */
  anchor?: PopoverPrimitive.Positioner.Props['anchor'];
  /**
   * Element the popup is portaled into. Defaults to the theme's portal
   * container.
   */
  container?: PopoverPrimitive.Portal.Props['container'];
  /** Keeps the popup mounted in the DOM while the popover is closed. */
  keepMounted?: boolean;
};
