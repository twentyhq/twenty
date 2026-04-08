import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import {
  type CreateMetadataEvent,
  type DeleteMetadataEvent,
  type MetadataEvent,
  type UpdateMetadataEvent,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';

const resolveRecordOverrides = (
  record: Record<string, unknown>,
): Record<string, unknown> => {
  const { overrides, isActive, ...base } = record;

  if (!isDefined(overrides)) {
    return base;
  }

  return { ...base, ...(overrides as Record<string, unknown>) };
};

const sanitizeCreatedEvent = (
  event: CreateMetadataEvent<AllMetadataName>,
): MetadataEvent | null => {
  const after = event.properties.after as Record<string, unknown>;

  if (after.isActive === false) {
    return null;
  }

  return {
    ...event,
    properties: { after: resolveRecordOverrides(after) },
  } as typeof event;
};

const sanitizeDeletedEvent = (
  event: DeleteMetadataEvent<AllMetadataName>,
): MetadataEvent => {
  const before = event.properties.before as Record<string, unknown>;

  return {
    ...event,
    properties: { before: resolveRecordOverrides(before) },
  } as typeof event;
};

const sanitizeUpdatedEvent = (
  event: UpdateMetadataEvent<AllMetadataName>,
): MetadataEvent | null => {
  const before = event.properties.before as Record<string, unknown>;
  const after = event.properties.after as Record<string, unknown>;

  if (before.isActive === false && after.isActive === false) {
    return null;
  }

  if (after.isActive === false) {
    return {
      type: 'deleted',
      metadataName: event.metadataName,
      recordId: event.recordId,
      properties: { before: resolveRecordOverrides(before) },
    } as MetadataEvent;
  }

  if (before.isActive === false) {
    return {
      type: 'created',
      metadataName: event.metadataName,
      recordId: event.recordId,
      properties: { after: resolveRecordOverrides(after) },
    } as MetadataEvent;
  }

  return {
    ...event,
    properties: {
      ...event.properties,
      before: resolveRecordOverrides(before),
      after: resolveRecordOverrides(after),
    },
  } as typeof event;
};

export const sanitizeOverridableEntityEventBatch = (
  metadataEventBatch: MetadataEventBatch,
): MetadataEventBatch => {
  const config =
    ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[
      metadataEventBatch.metadataName
    ];

  if (!('overrides' in config)) {
    return metadataEventBatch;
  }

  const events = metadataEventBatch.events
    .map((event) => {
      switch (event.type) {
        case 'created':
          return sanitizeCreatedEvent(event);
        case 'updated':
          return sanitizeUpdatedEvent(event);
        case 'deleted':
          return sanitizeDeletedEvent(event);
      }
    })
    .filter(isDefined);

  return { ...metadataEventBatch, events };
};
