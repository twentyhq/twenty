import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';
import {
  type IsTimelineActivityRecordReadable,
  resolveTimelineActivitySubject,
} from 'src/modules/timeline/utils/omit-restricted-fields-from-timeline-activity.util';

export const buildIsTimelineActivityRecordReadable = async ({
  timelineActivities,
  recordReadRestrictions,
  flatObjectMetadataMaps,
  filterReadableRecordIds,
}: {
  timelineActivities: Record<string, unknown>[];
  recordReadRestrictions: RecordReadRestrictions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  filterReadableRecordIds: (question: {
    objectMetadataId: string;
    recordIds: string[];
  }) => Promise<Set<string>>;
}): Promise<IsTimelineActivityRecordReadable> => {
  const recordIdsByObjectMetadataId = new Map<string, Set<string>>();

  for (const timelineActivity of timelineActivities) {
    const subject = resolveTimelineActivitySubject({
      timelineActivity,
      flatObjectMetadataMaps,
    });

    if (
      !isDefined(subject?.recordId) ||
      recordReadRestrictions.unreadableObjectMetadataIds.has(
        subject.flatObjectMetadata.id,
      )
    ) {
      continue;
    }

    const recordIds =
      recordIdsByObjectMetadataId.get(subject.flatObjectMetadata.id) ??
      new Set<string>();

    recordIds.add(subject.recordId.toLowerCase());
    recordIdsByObjectMetadataId.set(subject.flatObjectMetadata.id, recordIds);
  }

  const readableRecordIdsByObjectMetadataId = new Map(
    await Promise.all(
      [...recordIdsByObjectMetadataId].map(
        async ([objectMetadataId, recordIds]) =>
          [
            objectMetadataId,
            await filterReadableRecordIds({
              objectMetadataId,
              recordIds: [...recordIds],
            }),
          ] as const,
      ),
    ),
  );

  return ({ objectMetadataId, recordId }) =>
    readableRecordIdsByObjectMetadataId
      .get(objectMetadataId)
      ?.has(recordId.toLowerCase()) ?? false;
};
