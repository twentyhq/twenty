import { type RefObject } from 'react';

import { type DropdownKind } from '../types/DropdownKind';
import { type DropdownFocusTarget } from './DropdownFocusTarget';

export type DropdownContextValue = {
  kind: DropdownKind;
  open: boolean;
  multiple: boolean;
  isSubmenu: boolean;
  parentKind?: DropdownKind;
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
  registerPage: (page: { id: string; kind?: DropdownKind }) => void;
};
