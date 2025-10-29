import { type ViewEntityRelationProperties } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

export const VIEW_ENTITY_RELATION_PROPERTIES = [
  'objectMetadata',
  'viewFields',
  'viewFilters',
  'viewFilterGroups',
  'viewGroups',
  'viewSorts',
  'workspace',
  'createdBy',
  'application',
] as const satisfies ViewEntityRelationProperties[];
