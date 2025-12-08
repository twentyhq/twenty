import { type ViewGroupEntityRelationProperties } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';

export const VIEW_GROUP_ENTITY_RELATION_PROPERTIES = [
  'view',
  'workspace',
] as const satisfies ViewGroupEntityRelationProperties[];
