import { type RefObject } from 'react';

import { type DropdownType } from '../types/DropdownType';
import { type DropdownFocusTarget } from './DropdownFocusTarget';

export type DropdownContextValue = {
  type: DropdownType;
  open: boolean;
  multiple: boolean;
  isSubmenu: boolean;
  parentType?: DropdownType;
  activeItemId?: string;
  parentActiveItemId?: string;
  setActiveItemId: (id: string) => void;
  setParentActiveItemId?: (id: string) => void;
  pageId?: string;
  canGoBack: boolean;
  focusTargetRef: RefObject<DropdownFocusTarget | undefined>;
  initialFocusEdgeRef: RefObject<'first' | 'last'>;
  focusOnOpenRef: RefObject<boolean>;
  setOpen: (open: boolean) => void;
  closeTree: () => void;
  goToPage: (page: { id: string; trigger: DropdownFocusTarget }) => void;
  goBack: () => void;
  registerPage: (page: { id: string; type?: DropdownType }) => void;
};
