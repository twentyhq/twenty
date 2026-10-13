import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event.type';

const getMorphRelationRecord = (event: MetadataEvent) => {
  const record =
    event.type === 'deleted' ? event.properties.before : event.properties.after;

  if (
    !('type' in record) ||
    record.type !== FieldMetadataType.MORPH_RELATION ||
    !('morphId' in record) ||
    !isNonEmptyString(record.morphId)
  ) {
    return undefined;
  }

  return {
    type: record.type,
    universalIdentifier: record.universalIdentifier,
    morphId: record.morphId,
  };
};

const isHeadEvent = (event: MetadataEvent) => {
  const record = getMorphRelationRecord(event);

  return isDefined(record) && isMorphRelationHead(record);
};

const isTargetEvent = (event: MetadataEvent) => {
  const record = getMorphRelationRecord(event);

  return isDefined(record) && !isMorphRelationHead(record);
};

const buildHeadRefreshEvent = (head: FlatFieldMetadata): MetadataEvent => ({
  type: 'updated',
  metadataName: 'fieldMetadata',
  recordId: head.id,
  properties: { updatedFields: [], diff: {}, before: head, after: head },
});

export const selectFieldMetadataEventsForClients = ({
  events,
  isMorphRelationHeadEnabled,
  flatFieldMetadataMaps,
}: {
  events: MetadataEvent[];
  isMorphRelationHeadEnabled: boolean;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): MetadataEvent[] => {
  if (!isMorphRelationHeadEnabled) {
    return events.filter((event) => !isHeadEvent(event));
  }

  const selectedEvents = events.filter((event) => !isTargetEvent(event));
  const selectedRecordIds = new Set(
    selectedEvents.map((event) => event.recordId),
  );
  const headsToRefresh = new Map<string, FlatFieldMetadata>();

  for (const event of events) {
    const record = getMorphRelationRecord(event);

    if (!isDefined(record) || isMorphRelationHead(record)) {
      continue;
    }

    const head = flatFieldMetadataMaps.byUniversalIdentifier[record.morphId];

    if (isDefined(head) && !selectedRecordIds.has(head.id)) {
      headsToRefresh.set(head.id, head);
    }
  }

  return [
    ...selectedEvents,
    ...[...headsToRefresh.values()].map(buildHeadRefreshEvent),
  ];
};
