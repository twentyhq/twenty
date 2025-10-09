import { type ViewFilterEntityRelationProperties } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';

export const VIEW_FILTER_ENTITY_RELATION_PROPERTIES = [
  'fieldMetadata',
  'view',
  'viewFilterGroup',
  'workspace',
] as const satisfies ViewFilterEntityRelationProperties[];

