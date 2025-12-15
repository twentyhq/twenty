import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';

export const FLAT_PAGE_LAYOUT_TAB_EDITABLE_PROPERTIES = [
  'title',
  'position',
] as const satisfies (keyof FlatPageLayoutTab)[];
