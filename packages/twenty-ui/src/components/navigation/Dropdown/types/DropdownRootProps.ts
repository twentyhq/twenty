import { type ReactNode } from 'react';

import { type DropdownOpenChangeDetails } from './DropdownOpenChangeDetails';
import { type DropdownType } from './DropdownType';

export type DropdownRootProps = {
  children: ReactNode;
  type: DropdownType;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    eventDetails: DropdownOpenChangeDetails,
  ) => void;
  multiple?: boolean;
  defaultPage?: string;
};
