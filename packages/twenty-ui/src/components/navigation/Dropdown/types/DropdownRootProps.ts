import { type ReactNode } from 'react';

import { type DropdownDismissEvent } from './DropdownDismissEvent';
import { type DropdownType } from './DropdownType';

export type DropdownRootProps = {
  children: ReactNode;
  type: DropdownType;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onEscapeKeyDown?: (event: DropdownDismissEvent) => void;
  onInteractOutside?: (event: DropdownDismissEvent) => void;
  multiple?: boolean;
  defaultPage?: string;
};
