import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntityOperationRecord } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const getTimelineActivityTypeTargetRelationApplicationIds = ({
  flatFieldMetadataMaps,
  timelineActivityTypeOperations,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> | undefined;
  timelineActivityTypeOperations:
    | FlatEntityOperationRecord<'timelineActivityType'>
    | undefined;
}): string[] => {
  if (
    !isDefined(flatFieldMetadataMaps) ||
    !isDefined(timelineActivityTypeOperations)
  ) {
    return [];
  }

  const applicationIds = new Set<string>();

  for (const timelineActivityType of [
    ...Object.values(timelineActivityTypeOperations.flatEntityToCreate),
    ...Object.values(timelineActivityTypeOperations.flatEntityToUpdate),
    ...Object.values(timelineActivityTypeOperations.flatEntityToDelete),
  ]) {
    if (!isDefined(timelineActivityType)) {
      continue;
    }

    const targetRelationFieldUniversalIdentifier =
      timelineActivityType.targetRelationFieldUniversalIdentifier;

    if (!isDefined(targetRelationFieldUniversalIdentifier)) {
      continue;
    }

    const targetRelationField =
      flatFieldMetadataMaps.byUniversalIdentifier[
        targetRelationFieldUniversalIdentifier
      ];

    if (isDefined(targetRelationField)) {
      applicationIds.add(targetRelationField.applicationId);
    }
  }

  return [...applicationIds];
};
