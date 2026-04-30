import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';

const OVERRIDABLE_ENTITY_METADATA_NAMES = new Set<AllMetadataName>([
  'viewField',
  'viewFieldGroup',
  'pageLayoutTab',
  'pageLayoutWidget',
]);

const resolveRecordOverrides = (
  record: Record<string, unknown>,
): Record<string, unknown> => {
  const { overrides, ...base } = record;

  if (!isDefined(overrides)) {
    return base;
  }

  return { ...base, ...(overrides as Record<string, unknown>) };
};

const resolveEventOverrides = (event: MetadataEvent): MetadataEvent => {
  const properties = { ...event.properties };

  if ('before' in properties && isDefined(properties.before)) {
    properties.before = resolveRecordOverrides(
      properties.before as Record<string, unknown>,
    ) as typeof properties.before;
  }

  if ('after' in properties && isDefined(properties.after)) {
    properties.after = resolveRecordOverrides(
      properties.after as Record<string, unknown>,
    ) as typeof properties.after;
  }

  return { ...event, properties } as typeof event;
};

export const resolveOverridableEntityEventBatchOverrides = (
  metadataEventBatch: MetadataEventBatch,
): MetadataEventBatch => {
  if (!OVERRIDABLE_ENTITY_METADATA_NAMES.has(metadataEventBatch.metadataName)) {
    return metadataEventBatch;
  }

  const events = metadataEventBatch.events.map(resolveEventOverrides);

  return { ...metadataEventBatch, events };
};
