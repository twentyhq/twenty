import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import { DialogBackdrop } from './internal/DialogBackdrop';
import { DialogBody } from './internal/DialogBody';
import { DialogDescription } from './internal/DialogDescription';
import { DialogFooter } from './internal/DialogFooter';
import { DialogHeader } from './internal/DialogHeader';
import { DialogPopup } from './internal/DialogPopup';
import { DialogPortal } from './internal/DialogPortal';
import { DialogTitle } from './internal/DialogTitle';
import { DialogViewport } from './internal/DialogViewport';

export const Dialog = {
  createHandle: DialogPrimitive.createHandle,
  Handle: DialogPrimitive.Handle,
  Root: DialogPrimitive.Root,
  Trigger: DialogPrimitive.Trigger,
  Portal: DialogPortal,
  Backdrop: DialogBackdrop,
  Viewport: DialogViewport,
  Popup: DialogPopup,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogPrimitive.Close,
  Header: DialogHeader,
  Body: DialogBody,
  Footer: DialogFooter,
};
