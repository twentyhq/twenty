import { type FieldSideEffectFlatEntities } from 'src/engine/metadata-modules/field-side-effects/types/field-side-effect-flat-entities.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export type FieldSideEffectBuilder = (args: {
  field: UniversalFlatFieldMetadata;
  object: UniversalFlatObjectMetadata;
}) => FieldSideEffectFlatEntities;
