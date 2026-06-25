import { type SideEffectFlatEntities } from 'src/engine/metadata-modules/object-side-effects/types/side-effect-flat-entities.type';
import { type ObjectSideEffectContext } from 'src/engine/metadata-modules/object-side-effects/types/object-side-effect-context.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export type ObjectSideEffectBuilder = (args: {
  object: UniversalFlatObjectMetadata;
  fields: UniversalFlatFieldMetadata[];
  context: ObjectSideEffectContext;
}) => Partial<SideEffectFlatEntities>;
