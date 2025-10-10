import { type ViewFieldEntityRelationProperties } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';

export const VIEW_FIELD_ENTITY_RELATION_PROPERTIES = [
  'fieldMetadata',
  'view',
  'workspace',
] as const satisfies ViewFieldEntityRelationProperties[];
