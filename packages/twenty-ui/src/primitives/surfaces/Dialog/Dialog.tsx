import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import { DialogBody } from './internal/DialogBody';
import { DialogDescription } from './internal/DialogDescription';
import { DialogFooter } from './internal/DialogFooter';
import { DialogHeader } from './internal/DialogHeader';
import { DialogPopup } from './internal/DialogPopup';
import { DialogTitle } from './internal/DialogTitle';

export const Dialog = {
  createHandle: DialogPrimitive.createHandle,
  Root: DialogPrimitive.Root,
  Trigger: DialogPrimitive.Trigger,
  Popup: DialogPopup,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogPrimitive.Close,
  Header: DialogHeader,
  Body: DialogBody,
  Footer: DialogFooter,
};
