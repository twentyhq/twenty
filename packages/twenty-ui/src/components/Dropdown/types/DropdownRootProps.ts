import { type ReactNode } from 'react';

import { type DropdownKind } from './DropdownKind';

export type DropdownRootProps = {
  children: ReactNode;
  kind: DropdownKind;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  multiple?: boolean;
  defaultPage?: string;
};
