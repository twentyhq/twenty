import { getSystemViewFieldUniversalIdentifier } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const redirectMorphRelationTargetViewFieldToHead = ({
  sourceFlatFieldMetadata,
  flatViewFieldToCreate,
  relatedFlatEntityMaps,
}: {
  sourceFlatFieldMetadata: UniversalFlatFieldMetadata;
  flatViewFieldToCreate: UniversalFlatViewField;
  relatedFlatEntityMaps: BuildSideEffectsArgs<'fieldMetadata'>['relatedFlatEntityMaps'];
}): Record<string, UniversalFlatViewField> => {
  if (
    !isFlatFieldMetadataOfType(
      sourceFlatFieldMetadata,
      FieldMetadataType.MORPH_RELATION,
    )
  ) {
    return {
      [flatViewFieldToCreate.universalIdentifier]: flatViewFieldToCreate,
    };
  }

  const isHeadViewFieldAlreadyProvisioned =
    sourceFlatFieldMetadata.isSystemSideEffect ||
    isDefined(
      relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        sourceFlatFieldMetadata.morphId
      ],
    );

  if (isHeadViewFieldAlreadyProvisioned) {
    return {};
  }

  const headFlatViewField: UniversalFlatViewField = {
    ...flatViewFieldToCreate,
    universalIdentifier: getSystemViewFieldUniversalIdentifier({
      fieldMetadataApplicationUniversalIdentifier:
        sourceFlatFieldMetadata.applicationUniversalIdentifier,
      viewUniversalIdentifier: flatViewFieldToCreate.viewUniversalIdentifier,
      fieldMetadataUniversalIdentifier: sourceFlatFieldMetadata.morphId,
    }),
    fieldMetadataUniversalIdentifier: sourceFlatFieldMetadata.morphId,
  };

  return { [headFlatViewField.universalIdentifier]: headFlatViewField };
};
