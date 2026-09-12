import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

export const RECORD_FORM_PAGE_LAYOUT_NAME = 'Creation Form';

export const RECORD_FORM_TAB_PROPS = {
  title: 'Fields',
  position: 10,
  icon: 'IconList',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
} as const;
