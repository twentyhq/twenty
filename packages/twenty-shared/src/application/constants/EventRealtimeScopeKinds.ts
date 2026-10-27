import { type EventRealtimeScopeManifest } from '@/application/eventManifestType';

export const EVENT_REALTIME_SCOPE_KINDS = [
  'record',
  'visitor',
] as const satisfies readonly EventRealtimeScopeManifest['kind'][];
