import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';

type TimelineActivityTypeTargetRelation = Pick<
  FlatTimelineActivityType,
  'targetRelationFieldUniversalIdentifier'
>;

type TimelineActivityTypeTargetRelationOperations = {
  flatEntityToCreate: Partial<
    Record<string, TimelineActivityTypeTargetRelation>
  >;
  flatEntityToUpdate: Partial<
    Record<string, TimelineActivityTypeTargetRelation>
  >;
  flatEntityToDelete: Partial<
    Record<string, TimelineActivityTypeTargetRelation>
  >;
};

export const getTimelineActivityTypeTargetRelationApplicationIds = ({
  flatFieldMetadataMaps,
  timelineActivityTypeOperations,
}: {
  flatFieldMetadataMaps:
    | {
        byUniversalIdentifier: Partial<
          Record<string, Pick<FlatFieldMetadata, 'applicationId'>>
        >;
      }
    | undefined;
  timelineActivityTypeOperations:
    | TimelineActivityTypeTargetRelationOperations
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
