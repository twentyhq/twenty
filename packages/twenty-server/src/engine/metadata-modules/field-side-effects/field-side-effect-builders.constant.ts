import { buildUniqueIndexSideEffect } from 'src/engine/metadata-modules/field-side-effects/builders/build-unique-index.side-effect';
import { type FieldSideEffectBuilder } from 'src/engine/metadata-modules/field-side-effects/types/field-side-effect-builder.type';

export const FIELD_SIDE_EFFECT_BUILDERS_IN_EXECUTION_ORDER: FieldSideEffectBuilder[] =
  [buildUniqueIndexSideEffect];
