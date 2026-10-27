import { type EventRealtimeScope } from 'src/engine/metadata-modules/event-metadata/types/event-realtime-scope.type';

// Every segment is validated (UUIDs or ANONYMOUS_ID_PATTERN) before it gets here, so no client input can change the namespace
export const buildEventRealtimeChannel = ({
  workspaceId,
  eventMetadataId,
  scope,
}: {
  workspaceId: string;
  eventMetadataId: string;
  scope: EventRealtimeScope;
}): string =>
  scope.kind === 'record'
    ? `appEvent:${workspaceId}:${eventMetadataId}:record:${scope.objectMetadataId}:${scope.recordId}`
    : `appEvent:${workspaceId}:${eventMetadataId}:visitor:${scope.anonymousId}`;
