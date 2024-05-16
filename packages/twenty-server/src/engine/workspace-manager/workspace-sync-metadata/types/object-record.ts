import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export type ObjectRecord<T extends BaseWorkspaceEntity> = {
  [K in keyof T as T[K] extends BaseWorkspaceEntity
    ? `${Extract<K, string>}Id`
    : K]: T[K] extends BaseWorkspaceEntity ? string : T[K];
} & {
  [K in keyof T]: T[K] extends BaseWorkspaceEntity ? ObjectRecord<T[K]> : T[K];
};
