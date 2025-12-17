import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

export const FLAT_PAGE_LAYOUT_WIDGET_EDITABLE_PROPERTIES = [
  'title',
  'type',
  'objectMetadataId',
  'gridPosition',
  'configuration',
] as const satisfies (keyof FlatPageLayoutWidget)[];
