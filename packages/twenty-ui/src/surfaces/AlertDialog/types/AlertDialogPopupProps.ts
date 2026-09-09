import { type AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';

import { type AlertDialogSize } from './AlertDialogSize';

export type AlertDialogPopupProps = AlertDialogPrimitive.Popup.Props & {
  size?: AlertDialogSize;
  container?: AlertDialogPrimitive.Portal.Props['container'];
  keepMounted?: boolean;
};
