import { OBJECT_SIDE_EFFECT_BUILDERS_IN_EXECUTION_ORDER } from 'src/engine/metadata-modules/object-side-effects/object-side-effect-builders.constant';
import { type SideEffectFlatEntities } from 'src/engine/metadata-modules/object-side-effects/types/side-effect-flat-entities.type';
import { type ObjectSideEffectContext } from 'src/engine/metadata-modules/object-side-effects/types/object-side-effect-context.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const buildObjectSideEffects = ({
  object,
  fields,
  context,
}: {
  object: UniversalFlatObjectMetadata;
  fields: UniversalFlatFieldMetadata[];
  context: ObjectSideEffectContext;
}): SideEffectFlatEntities => {
  const sideEffectPartials = OBJECT_SIDE_EFFECT_BUILDERS_IN_EXECUTION_ORDER.map(
    (buildSideEffect) => buildSideEffect({ object, fields, context }),
  );

  return {
    view: sideEffectPartials.flatMap((partial) => partial.view ?? []),
    viewField: sideEffectPartials.flatMap((partial) => partial.viewField ?? []),
    pageLayout: sideEffectPartials.flatMap(
      (partial) => partial.pageLayout ?? [],
    ),
    pageLayoutTab: sideEffectPartials.flatMap(
      (partial) => partial.pageLayoutTab ?? [],
    ),
    pageLayoutWidget: sideEffectPartials.flatMap(
      (partial) => partial.pageLayoutWidget ?? [],
    ),
    searchFieldMetadata: sideEffectPartials.flatMap(
      (partial) => partial.searchFieldMetadata ?? [],
    ),
    fieldMetadata: sideEffectPartials.flatMap(
      (partial) => partial.fieldMetadata ?? [],
    ),
    index: sideEffectPartials.flatMap((partial) => partial.index ?? []),
  };
};
