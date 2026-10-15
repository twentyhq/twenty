import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event.type';

const getMorphRelationFieldFromEvent = (event: MetadataEvent) => {
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

const isMorphRelationHeadFieldEvent = (event: MetadataEvent) => {
  const morphRelationField = getMorphRelationFieldFromEvent(event);

  return (
    isDefined(morphRelationField) && isMorphRelationHead(morphRelationField)
  );
};

const isMorphRelationTargetFieldEvent = (event: MetadataEvent) => {
  const morphRelationField = getMorphRelationFieldFromEvent(event);

  return (
    isDefined(morphRelationField) && !isMorphRelationHead(morphRelationField)
  );
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
  isMorphRelationHeadEnabled,
  flatFieldMetadataMaps,
}: {
  events: MetadataEvent[];
  isMorphRelationHeadEnabled: boolean;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): MetadataEvent[] => {
  if (!isMorphRelationHeadEnabled) {
    return events.filter((event) => !isMorphRelationHeadFieldEvent(event));
  }

  const eventsWithoutTargetFields = events.filter(
    (event) => !isMorphRelationTargetFieldEvent(event),
  );
  const recordIdsWithEvent = new Set(
    eventsWithoutTargetFields.map((event) => event.recordId),
  );
  const headsWithChangedTargets = new Map<string, FlatFieldMetadata>();

  for (const event of events) {
    const morphRelationField = getMorphRelationFieldFromEvent(event);

    if (
      !isDefined(morphRelationField) ||
      isMorphRelationHead(morphRelationField)
    ) {
      continue;
    }

    const head =
      flatFieldMetadataMaps.byUniversalIdentifier[morphRelationField.morphId];

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
