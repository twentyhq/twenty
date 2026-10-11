import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';

import { AlertDialogBackdrop } from './internal/AlertDialogBackdrop';
import { AlertDialogBody } from './internal/AlertDialogBody';
import { AlertDialogDescription } from './internal/AlertDialogDescription';
import { AlertDialogFooter } from './internal/AlertDialogFooter';
import { AlertDialogHeader } from './internal/AlertDialogHeader';
import { AlertDialogPortal } from './internal/AlertDialogPortal';
import { AlertDialogPopup } from './internal/AlertDialogPopup';
import { AlertDialogTitle } from './internal/AlertDialogTitle';
import { AlertDialogViewport } from './internal/AlertDialogViewport';

const createAlertDialog = () => ({
  Root: AlertDialogPrimitive.Root,
  Trigger: AlertDialogPrimitive.Trigger,
  Portal: AlertDialogPortal,
  Backdrop: AlertDialogBackdrop,
  Viewport: AlertDialogViewport,
  Popup: AlertDialogPopup,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Close: AlertDialogPrimitive.Close,
  Header: AlertDialogHeader,
  Body: AlertDialogBody,
  Footer: AlertDialogFooter,
  Handle: AlertDialogPrimitive.Handle,
  createHandle: AlertDialogPrimitive.createHandle,
});

// Base UI namespace reads would otherwise retain AlertDialog in unrelated imports.
export const AlertDialog = /* @__PURE__ */ createAlertDialog();
