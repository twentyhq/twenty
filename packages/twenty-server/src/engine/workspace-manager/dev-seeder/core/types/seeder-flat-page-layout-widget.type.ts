import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

export type SeederFlatPageLayoutWidget = Pick<
  FlatPageLayoutWidget,
  | 'id'
  | 'pageLayoutTabId'
  | 'title'
  | 'type'
  | 'gridPosition'
  | 'configuration'
  | 'objectMetadataId'
>;
