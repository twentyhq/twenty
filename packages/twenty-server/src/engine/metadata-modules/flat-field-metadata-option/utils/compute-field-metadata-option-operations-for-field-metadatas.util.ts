import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityToCreateDeleteUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type FlatFieldMetadataOptionMaps } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option-maps.type';
import { computeFieldMetadataOptionOperationsForField } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/compute-field-metadata-option-operations-for-field.util';
import { isFieldMetadataOptionEntityAvailable } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/is-field-metadata-option-entity-available.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatFieldMetadataOption } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata-option.type';

export const computeFieldMetadataOptionOperationsForFieldMetadatas = ({
  flatFieldMetadatasToCreate = [],
  flatFieldMetadatasToUpdate = [],
  flatFieldMetadatasToDelete = [],
  existingFlatFieldMetadataOptionMaps,
  applicationUniversalIdentifier,
}: {
  flatFieldMetadatasToCreate?: UniversalFlatFieldMetadata[];
  flatFieldMetadatasToUpdate?: UniversalFlatFieldMetadata[];
  flatFieldMetadatasToDelete?: UniversalFlatFieldMetadata[];
  existingFlatFieldMetadataOptionMaps: FlatFieldMetadataOptionMaps;
  applicationUniversalIdentifier: string;
}): FlatEntityToCreateDeleteUpdate<'fieldMetadataOption'> => {
  const operations: FlatEntityToCreateDeleteUpdate<'fieldMetadataOption'> = {
    flatEntityToCreate: [],
    flatEntityToUpdate: [],
    flatEntityToDelete: [],
  };

  if (!isFieldMetadataOptionEntityAvailable()) {
    return operations;
  }

  const existingOptionsByFieldMetadataUniversalIdentifier = new Map<
    string,
    UniversalFlatFieldMetadataOption[]
  >();

  for (const existingOption of Object.values(
    existingFlatFieldMetadataOptionMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(existingOption)) {
      continue;
    }

    existingOptionsByFieldMetadataUniversalIdentifier.set(
      existingOption.fieldMetadataUniversalIdentifier,
      [
        ...(existingOptionsByFieldMetadataUniversalIdentifier.get(
          existingOption.fieldMetadataUniversalIdentifier,
        ) ?? []),
        existingOption,
      ],
    );
  }

  const fieldsWithTarget = [
    ...[...flatFieldMetadatasToCreate, ...flatFieldMetadatasToUpdate].map(
      (flatFieldMetadata) => ({
        fieldMetadataUniversalIdentifier: flatFieldMetadata.universalIdentifier,
        targetUniversalFlatFieldMetadata: flatFieldMetadata,
      }),
    ),
    ...flatFieldMetadatasToDelete.map((flatFieldMetadata) => ({
      fieldMetadataUniversalIdentifier: flatFieldMetadata.universalIdentifier,
      targetUniversalFlatFieldMetadata: undefined,
    })),
  ];

  for (const {
    fieldMetadataUniversalIdentifier,
    targetUniversalFlatFieldMetadata,
  } of fieldsWithTarget) {
    const fieldOperations = computeFieldMetadataOptionOperationsForField({
      targetUniversalFlatFieldMetadata,
      existingOptions:
        existingOptionsByFieldMetadataUniversalIdentifier.get(
          fieldMetadataUniversalIdentifier,
        ) ?? [],
      isUniversalIdentifierUsedByOtherField: (universalIdentifier) => {
        const existingOption =
          existingFlatFieldMetadataOptionMaps.byUniversalIdentifier[
            universalIdentifier
          ];

        return (
          isDefined(existingOption) &&
          existingOption.fieldMetadataUniversalIdentifier !==
            fieldMetadataUniversalIdentifier
        );
      },
      applicationUniversalIdentifier,
    });

    operations.flatEntityToCreate.push(
      ...Object.values(fieldOperations.flatEntityToCreate),
    );
    operations.flatEntityToUpdate.push(
      ...Object.values(fieldOperations.flatEntityToUpdate),
    );
    operations.flatEntityToDelete.push(
      ...Object.values(fieldOperations.flatEntityToDelete),
    );
  }

  return operations;
};
