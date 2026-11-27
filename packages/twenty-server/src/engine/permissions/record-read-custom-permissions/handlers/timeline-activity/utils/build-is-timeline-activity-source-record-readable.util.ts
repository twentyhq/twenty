import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type IsTimelineActivitySourceRecordReadable,
  resolveTimelineActivitySourceRecord,
} from 'src/engine/permissions/record-read-custom-permissions/handlers/timeline-activity/utils/omit-unreadable-fields-from-timeline-activity-properties.util';

export const buildIsTimelineActivitySourceRecordReadable = async ({
  timelineActivities,
  flatObjectMetadataMaps,
  filterReadableRecordIds,
}: {
  timelineActivities: Record<string, unknown>[];
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  filterReadableRecordIds: (question: {
    objectMetadataId: string;
    recordIds: string[];
  }) => Promise<Set<string>>;
}): Promise<IsTimelineActivitySourceRecordReadable> => {
  const recordIdsByObjectMetadataId = new Map<string, Set<string>>();

  for (const timelineActivity of timelineActivities) {
    const sourceRecord = resolveTimelineActivitySourceRecord({
      timelineActivity,
      flatObjectMetadataMaps,
    });

    if (!isDefined(sourceRecord?.recordId)) {
      continue;
    }

    const recordIds =
      recordIdsByObjectMetadataId.get(sourceRecord.flatObjectMetadata.id) ??
      new Set<string>();

    recordIds.add(sourceRecord.recordId.toLowerCase());
    recordIdsByObjectMetadataId.set(
      sourceRecord.flatObjectMetadata.id,
      recordIds,
    );
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
