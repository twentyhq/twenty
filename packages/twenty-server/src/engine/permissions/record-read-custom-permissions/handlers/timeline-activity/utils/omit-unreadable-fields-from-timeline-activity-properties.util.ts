import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { filterFieldNamesInEventProperties } from 'src/engine/permissions/utils/filter-field-names-in-event-properties.util';
import { getFieldNamesInEventProperties } from 'src/engine/permissions/utils/get-field-names-in-event-properties.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';
import { buildTimelineActivityRelatedMorphFieldMetadataName } from 'src/modules/timeline/utils/timeline-activity-related-morph-field-metadata-name-builder.util';

const objectByTargetColumnNameCache = new WeakMap<
  FlatEntityMaps<FlatObjectMetadata>,
  Map<string, FlatObjectMetadata>
>();

const getObjectByTargetColumnName = (
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
): Map<string, FlatObjectMetadata> => {
  const cachedObjectByTargetColumnName = objectByTargetColumnNameCache.get(
    flatObjectMetadataMaps,
  );

  if (isDefined(cachedObjectByTargetColumnName)) {
    return cachedObjectByTargetColumnName;
  }

  const objectByTargetColumnName = new Map<string, FlatObjectMetadata>();

  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  )) {
    if (isDefined(flatObjectMetadata)) {
      objectByTargetColumnName.set(
        `${buildTimelineActivityRelatedMorphFieldMetadataName(flatObjectMetadata.nameSingular)}Id`,
        flatObjectMetadata,
      );
    }
  }

  objectByTargetColumnNameCache.set(
    flatObjectMetadataMaps,
    objectByTargetColumnName,
  );

  return objectByTargetColumnName;
};

export type IsTimelineActivitySourceRecordReadable = (recordReference: {
  objectMetadataId: string;
  recordId: string;
}) => boolean;

type TimelineActivitySourceRecord = {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'id' | 'fieldIds'>;
  recordId: string | undefined;
};

export const resolveTimelineActivitySourceRecord = ({
  timelineActivity,
  flatObjectMetadataMaps,
}: {
  timelineActivity: Record<string, unknown>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): TimelineActivitySourceRecord | undefined => {
  if (!('linkedObjectMetadataId' in timelineActivity)) {
    return undefined;
  }

  const { linkedObjectMetadataId, linkedRecordId } = timelineActivity;

  if (isNonEmptyString(linkedObjectMetadataId)) {
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: linkedObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      return undefined;
    }

    return {
      flatObjectMetadata,
      recordId: isNonEmptyString(linkedRecordId) ? linkedRecordId : undefined,
    };
  }

  const objectByTargetColumnName = getObjectByTargetColumnName(
    flatObjectMetadataMaps,
  );

  for (const [columnName, value] of Object.entries(timelineActivity)) {
    const flatObjectMetadata = objectByTargetColumnName.get(columnName);

    if (isDefined(flatObjectMetadata) && isNonEmptyString(value)) {
      return { flatObjectMetadata, recordId: value };
    }
  }

  return undefined;
};

const buildReadableFieldNames = ({
  sourceRecord: { flatObjectMetadata, recordId },
  recordReadRestrictions,
  isSourceRecordReadable,
  flatFieldMetadataMaps,
}: {
  sourceRecord: TimelineActivitySourceRecord;
  recordReadRestrictions: RecordReadRestrictions;
  isSourceRecordReadable: IsTimelineActivitySourceRecordReadable;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): Set<string> => {
  if (
    !isDefined(recordId) ||
    !isSourceRecordReadable({
      objectMetadataId: flatObjectMetadata.id,
      recordId,
    })
  ) {
    return new Set();
  }

  return new Set(
    flatObjectMetadata.fieldIds.flatMap((fieldId) => {
      const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (
        !isDefined(flatFieldMetadata) ||
        recordReadRestrictions.unreadableFieldMetadataIds.has(fieldId)
      ) {
        return [];
      }

      return getFieldNamesInEventProperties(flatFieldMetadata);
    }),
  );
};

export const omitUnreadableFieldsFromTimelineActivityProperties = ({
  properties,
  timelineActivity,
  recordReadRestrictions,
  isSourceRecordReadable,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  properties: unknown;
  timelineActivity: Record<string, unknown>;
  recordReadRestrictions: RecordReadRestrictions;
  isSourceRecordReadable: IsTimelineActivitySourceRecordReadable;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): Record<string, unknown> | null => {
  if (!isPlainObject(properties)) {
    return null;
  }

  const sourceRecord = resolveTimelineActivitySourceRecord({
    timelineActivity,
    flatObjectMetadataMaps,
  });

  const readableFieldNames = isDefined(sourceRecord)
    ? buildReadableFieldNames({
        sourceRecord,
        recordReadRestrictions,
        isSourceRecordReadable,
        flatFieldMetadataMaps,
      })
    : new Set<string>();

  return {
    ...properties,
    ...filterFieldNamesInEventProperties({
      properties,
      isFieldNameKept: (fieldName) => readableFieldNames.has(fieldName),
    }),
  };
};
