import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';

// Note: This is actually not enterely correct, id field should only be added if the relation is MANY_TO_ONE or ONE_TO_ONE
export type ObjectRecord<T extends BaseObjectMetadata> = {
  [K in keyof T as T[K] extends BaseObjectMetadata
    ? `${Extract<K, string>}Id`
    : K]: T[K] extends BaseObjectMetadata ? string : T[K];
} & {
  [K in keyof T]: T[K] extends BaseObjectMetadata ? ObjectRecord<T[K]> : T[K];
};
