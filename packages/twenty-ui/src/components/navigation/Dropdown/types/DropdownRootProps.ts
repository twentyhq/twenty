import { type ReactNode } from 'react';

import { type DropdownType } from './DropdownType';

export type DropdownRootProps = {
  children: ReactNode;
  type: DropdownType;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  multiple?: boolean;
  defaultPage?: string;
};
