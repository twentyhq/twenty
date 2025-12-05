import { type PageLayoutWidgetEntityRelationProperties } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

export const PAGE_LAYOUT_WIDGET_ENTITY_RELATION_PROPERTIES = [
  'workspace',
  'pageLayoutTab',
  'objectMetadata',
  'application',
] as const satisfies PageLayoutWidgetEntityRelationProperties[];
