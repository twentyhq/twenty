import { type Dispatch, type SetStateAction } from 'react';

import { type DropdownType } from '../types/DropdownType';
import { type DropdownFocusTarget } from './DropdownFocusTarget';
import { type DropdownPageFocusRequest } from './DropdownPageFocusRequest';
import { type DropdownRowFocus } from './DropdownRowFocus';
import { type useDropdownSelections } from './useDropdownSelections';

export type DropdownContextValue = ReturnType<typeof useDropdownSelections> & {
  type: DropdownType;
  rootType: DropdownType;
  open: boolean;
  multiple: boolean;
  isSubmenu: boolean;
  parentType?: DropdownType;
  rowFocus: DropdownRowFocus;
  parentRowFocus?: DropdownRowFocus;
  setRowIds: Dispatch<SetStateAction<string[] | undefined>>;
  pageId?: string;
  pageFocusRequest?: DropdownPageFocusRequest;
  setPageFocusRequest: (request: DropdownPageFocusRequest | undefined) => void;
  canGoBack: boolean;
  initialFocusEdge: 'first' | 'last';
  setInitialFocusEdge: (edge: 'first' | 'last') => void;
  focusOnOpen: boolean;
  setFocusOnOpen: (focusOnOpen: boolean) => void;
  setOpen: (open: boolean) => void;
  closeTree: (tabOutEvent?: Event) => void;
  tabForwardOutOfTree: (tab: {
    ownerDocument: Document;
    tabOutEvent: Event;
  }) => void;
  goToPage: (page: { id: string; trigger?: DropdownFocusTarget }) => void;
  goBack: () => void;
  registerPage: (page: { id: string; type?: DropdownType }) => void;
  registerOpenNestedRoot: () => () => void;
  searchTargetId?: string;
  setSearchTargetId: (id: string | undefined) => void;
  triggerId?: string;
  registerTrigger: (id: string) => () => void;
  titleId?: string;
  registerTitle: (id: string) => () => void;
};
