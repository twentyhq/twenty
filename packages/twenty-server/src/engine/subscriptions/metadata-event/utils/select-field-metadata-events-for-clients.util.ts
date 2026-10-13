import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event.type';

const getMorphRelationMorphId = (event: MetadataEvent): string | undefined => {
  const record =
    event.type === 'deleted' ? event.properties.before : event.properties.after;

  return 'type' in record &&
    record.type === FieldMetadataType.MORPH_RELATION &&
    'morphId' in record &&
    isNonEmptyString(record.morphId)
    ? record.morphId
    : undefined;
};

const isMorphRelationHeadEvent = ({
  event,
  morphId,
}: {
  event: MetadataEvent;
  morphId: string;
}) => {
  const record =
    event.type === 'deleted' ? event.properties.before : event.properties.after;

  return record.universalIdentifier === morphId;
};

export const selectFieldMetadataEventsForClients = ({
  events,
  isMorphRelationHeadEnabled,
  flatFieldMetadataMaps,
}: {
  events: MetadataEvent[];
  isMorphRelationHeadEnabled: boolean;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): MetadataEvent[] => {
  const selectedEvents: MetadataEvent[] = [];
  const headsToRefresh = new Map<string, FlatFieldMetadata>();

  for (const event of events) {
    const morphId = getMorphRelationMorphId(event);

    if (!isDefined(morphId)) {
      selectedEvents.push(event);
      continue;
    }

    if (isMorphRelationHeadEvent({ event, morphId })) {
      if (isMorphRelationHeadEnabled) {
        selectedEvents.push(event);
      }
      continue;
    }

    if (!isMorphRelationHeadEnabled) {
      selectedEvents.push(event);
      continue;
    }

    const head = flatFieldMetadataMaps.byUniversalIdentifier[morphId];

    if (isDefined(head)) {
      headsToRefresh.set(head.id, head);
    }
  }

  const selectedRecordIds = new Set(
    selectedEvents.map((event) => event.recordId),
  );

  for (const head of headsToRefresh.values()) {
    if (selectedRecordIds.has(head.id)) {
      continue;
    }

    selectedEvents.push({
      type: 'updated',
      metadataName: 'fieldMetadata',
      recordId: head.id,
      properties: {
        updatedFields: [],
        diff: {},
        before: head,
        after: head,
      },
    });
  }

  return selectedEvents;
};
