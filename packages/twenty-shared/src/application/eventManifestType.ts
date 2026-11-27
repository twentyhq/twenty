import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';

export type EventManifest = SyncableEntityOptions & {
  name: string;
  label: string;
  description?: string;
  icon?: string;
  schema?: InputJsonSchema;
};
