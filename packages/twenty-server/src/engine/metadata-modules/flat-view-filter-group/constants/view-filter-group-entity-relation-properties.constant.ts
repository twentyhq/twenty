import { type ViewFilterGroupEntityRelationProperties } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';

export const VIEW_FILTER_GROUP_ENTITY_RELATION_PROPERTIES = [
  'view',
  'viewFilters',
  'parentViewFilterGroup',
  'childViewFilterGroups',
  'workspace',
  'application',
] as const satisfies ViewFilterGroupEntityRelationProperties[];

