import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

type RelationKeys<T> = {
  [K in keyof T]: T[K] extends BaseWorkspaceEntity ? K : never;
}[keyof T];

type ForeignKeyMap<T> = {
  [K in RelationKeys<T> as `${K & string}Id`]?: string | null | undefined;
};

type RecursiveObjectRecord<T> = {
  [P in keyof T]: T[P] extends BaseWorkspaceEntity
    ? ObjectRecord<T[P]> & ForeignKeyMap<T[P]>
    : T[P];
};

export type ObjectRecord<T> = RecursiveObjectRecord<T> & ForeignKeyMap<T>;
