import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event.type';

const getMorphRelationTargetFromEvent = (event: MetadataEvent) => {
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

  const morphRelationField = {
    type: record.type,
    universalIdentifier: record.universalIdentifier,
    morphId: record.morphId,
  };

  return isMorphRelationHead(morphRelationField)
    ? undefined
    : morphRelationField;
};

const buildMorphRelationHeadUpdatedEvent = (
  head: FlatFieldMetadata,
): MetadataEvent => ({
  type: 'updated',
  metadataName: 'fieldMetadata',
  recordId: head.id,
  properties: { updatedFields: [], diff: {}, before: head, after: head },
});

export const filterMorphRelationDuplicateFieldMetadataEvents = ({
  events,
  flatFieldMetadataMaps,
}: {
  events: MetadataEvent[];
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): MetadataEvent[] => {
  const eventsWithoutTargetFields = events.filter(
    (event) => !isDefined(getMorphRelationTargetFromEvent(event)),
  );
  const recordIdsWithEvent = new Set(
    eventsWithoutTargetFields.map((event) => event.recordId),
  );
  const headsWithChangedTargets = new Map<string, FlatFieldMetadata>();

  for (const event of events) {
    const morphRelationTarget = getMorphRelationTargetFromEvent(event);

    if (!isDefined(morphRelationTarget)) {
      continue;
    }

    const head =
      flatFieldMetadataMaps.byUniversalIdentifier[morphRelationTarget.morphId];

    if (isDefined(head) && !recordIdsWithEvent.has(head.id)) {
      headsWithChangedTargets.set(head.id, head);
    }
  }

  return [
    ...eventsWithoutTargetFields,
    ...[...headsWithChangedTargets.values()].map(
      buildMorphRelationHeadUpdatedEvent,
    ),
  ];
};
