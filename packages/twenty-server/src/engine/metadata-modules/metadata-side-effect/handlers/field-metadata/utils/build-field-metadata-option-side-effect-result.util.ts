import { isDefined } from 'twenty-shared/utils';

import { computeFieldMetadataOptionOperationsForField } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/compute-field-metadata-option-operations-for-field.util';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export const buildFieldMetadataOptionSideEffectResult = ({
  fieldMetadataUniversalIdentifier,
  targetUniversalFlatFieldMetadata,
  relatedFlatEntityMaps,
  context,
}: {
  fieldMetadataUniversalIdentifier: string;
  targetUniversalFlatFieldMetadata: UniversalFlatFieldMetadata | undefined;
} & Pick<
  BuildSideEffectsArgs<'fieldMetadata'>,
  'relatedFlatEntityMaps' | 'context'
>): MetadataSideEffectResult => {
  const existingFlatFieldMetadata =
    relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
      fieldMetadataUniversalIdentifier
    ];

  const existingOptions = (
    existingFlatFieldMetadata?.fieldMetadataOptionUniversalIdentifiers ?? []
  )
    .map(
      (fieldMetadataOptionUniversalIdentifier) =>
        relatedFlatEntityMaps.flatFieldMetadataOptionMaps.byUniversalIdentifier[
          fieldMetadataOptionUniversalIdentifier
        ],
    )
    .filter(isDefined);

  const operations = computeFieldMetadataOptionOperationsForField({
    fieldMetadataUniversalIdentifier,
    targetUniversalFlatFieldMetadata,
    existingOptions,
    applicationUniversalIdentifier:
      context.buildOptions.applicationUniversalIdentifier,
  });

  const hasOperations = Object.values(operations).some(
    (flatEntityRecord) => Object.keys(flatEntityRecord).length > 0,
  );

  if (!hasOperations) {
    return { status: 'noop' };
  }

  return {
    status: 'success',
    operations: { fieldMetadataOption: operations },
  };
};
