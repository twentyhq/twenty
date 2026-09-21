import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';

import { AlertDialogBody } from './internal/AlertDialogBody';
import { AlertDialogDescription } from './internal/AlertDialogDescription';
import { AlertDialogFooter } from './internal/AlertDialogFooter';
import { AlertDialogHeader } from './internal/AlertDialogHeader';
import { AlertDialogPopup } from './internal/AlertDialogPopup';
import { AlertDialogTitle } from './internal/AlertDialogTitle';

const createAlertDialog = () => ({
  Root: AlertDialogPrimitive.Root,
  Trigger: AlertDialogPrimitive.Trigger,
  Popup: AlertDialogPopup,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Close: AlertDialogPrimitive.Close,
  Header: AlertDialogHeader,
  Body: AlertDialogBody,
  Footer: AlertDialogFooter,
});

// Base UI namespace reads would otherwise retain AlertDialog in unrelated imports.
export const AlertDialog = /* @__PURE__ */ createAlertDialog();
