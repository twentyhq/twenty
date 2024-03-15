import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';

export type ObjectRecord<T extends BaseObjectMetadata> = {
  [K in keyof T as T[K] extends BaseObjectMetadata
    ? `${Extract<K, string>}Id`
    : K]: T[K] extends BaseObjectMetadata ? string : T[K];
} & {
  [K in keyof T]: T[K] extends BaseObjectMetadata ? ObjectRecord<T[K]> : T[K];
};
