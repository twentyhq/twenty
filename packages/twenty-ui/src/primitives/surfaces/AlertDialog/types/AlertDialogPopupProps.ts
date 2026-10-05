import { type AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';

import { type AlertDialogSize } from './AlertDialogSize';

export type AlertDialogPopupProps = AlertDialogPrimitive.Popup.Props & {
  /** Width of the dialog, or `fullscreen` to fill the viewport. */
  size?: AlertDialogSize;
  /**
   * Element the dialog is portaled into. Defaults to the theme's portal
   * container.
   */
  container?: AlertDialogPrimitive.Portal.Props['container'];
  /** Keeps the dialog mounted in the DOM while it is closed. */
  keepMounted?: boolean;
};
