import { FIELD_SIDE_EFFECT_BUILDERS_IN_EXECUTION_ORDER } from 'src/engine/metadata-modules/field-side-effects/field-side-effect-builders.constant';
import {
  EMPTY_FIELD_SIDE_EFFECT_FLAT_ENTITIES,
  type FieldSideEffectFlatEntities,
} from 'src/engine/metadata-modules/field-side-effects/types/field-side-effect-flat-entities.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const buildFieldSideEffects = ({
  field,
  object,
}: {
  field: UniversalFlatFieldMetadata;
  object: UniversalFlatObjectMetadata;
}): FieldSideEffectFlatEntities =>
  FIELD_SIDE_EFFECT_BUILDERS_IN_EXECUTION_ORDER.reduce<FieldSideEffectFlatEntities>(
    (accumulator, buildSideEffect) => {
      const sideEffects = buildSideEffect({ field, object });

      return {
        indexes: [...accumulator.indexes, ...sideEffects.indexes],
      };
    },
    EMPTY_FIELD_SIDE_EFFECT_FLAT_ENTITIES,
  );
