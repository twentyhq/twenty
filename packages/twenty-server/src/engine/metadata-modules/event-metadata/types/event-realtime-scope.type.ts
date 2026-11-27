export type EventRealtimeScope =
  | { kind: 'record'; objectMetadataId: string; recordId: string }
  | { kind: 'visitor'; anonymousId: string };
