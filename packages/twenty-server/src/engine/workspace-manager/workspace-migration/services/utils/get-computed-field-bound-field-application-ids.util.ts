import { isDefined } from 'twenty-shared/utils';

import { isFieldMetadataComputation } from 'src/engine/metadata-modules/computed-field/utils/is-field-metadata-computation.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type ComputedFieldCandidate = { computation?: unknown };

// Bindings are no foreign key: the applications of the fields a computation reads are not found through relations.
// Follows the computed fields it reads, which validation evaluates too.
export const getComputedFieldBoundFieldApplicationIds = ({
  flatFieldMetadataMaps,
  fieldMetadataOperations,
}: {
  flatFieldMetadataMaps:
    | {
        byUniversalIdentifier: Partial<
          Record<
            string,
            Pick<FlatFieldMetadata, 'applicationId' | 'computation'>
          >
        >;
      }
    | undefined;
  fieldMetadataOperations:
    | {
        flatEntityToCreate: Partial<Record<string, ComputedFieldCandidate>>;
        flatEntityToUpdate: Partial<Record<string, ComputedFieldCandidate>>;
      }
    | undefined;
}): string[] => {
  if (
    !isDefined(flatFieldMetadataMaps) ||
    !isDefined(fieldMetadataOperations)
  ) {
    return [];
  }

  const applicationIds = new Set<string>();
  const visitedFieldUniversalIdentifiers = new Set<string>();
  const fieldsToVisit: (ComputedFieldCandidate | undefined)[] = [
    ...Object.values(fieldMetadataOperations.flatEntityToCreate),
    ...Object.values(fieldMetadataOperations.flatEntityToUpdate),
  ];

  for (const field of fieldsToVisit) {
    if (!isFieldMetadataComputation(field?.computation)) {
      continue;
    }

    for (const boundFieldUniversalIdentifier of Object.values(
      field.computation.bindings ?? {},
    )) {
      const boundField =
        flatFieldMetadataMaps.byUniversalIdentifier[
          boundFieldUniversalIdentifier
        ];

      if (
        !isDefined(boundField) ||
        visitedFieldUniversalIdentifiers.has(boundFieldUniversalIdentifier)
      ) {
        continue;
      }

      visitedFieldUniversalIdentifiers.add(boundFieldUniversalIdentifier);
      applicationIds.add(boundField.applicationId);
      fieldsToVisit.push(boundField);
    }
  }

  return [...applicationIds];
};
