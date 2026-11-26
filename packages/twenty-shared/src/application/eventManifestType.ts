import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';

export type EventRealtimeScopeManifest =
  | { kind: 'record'; property: string }
  | { kind: 'visitor' };

export type EventCapabilitiesManifest = {
  realtime?: {
    scopes: EventRealtimeScopeManifest[];
  };
};

export type EventManifest = SyncableEntityOptions & {
  name: string;
  label: string;
  description?: string;
  icon?: string;
  schema?: InputJsonSchema;
  capabilities?: EventCapabilitiesManifest;
};
