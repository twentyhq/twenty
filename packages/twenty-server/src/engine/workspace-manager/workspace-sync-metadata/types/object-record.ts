import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

type RelationKeys<T> = {
  [K in keyof T]: NonNullable<T[K]> extends BaseWorkspaceEntity ? K : never;
}[keyof T];

type ForeignKeyMap<T> = {
  [K in RelationKeys<T> as `${K & string}Id`]: string;
};

type RecursiveObjectRecord<T> = {
  [P in keyof T]: NonNullable<T[P]> extends BaseWorkspaceEntity
    ? ObjectRecord<NonNullable<T[P]>> & ForeignKeyMap<NonNullable<T[P]>>
    : T[P];
};

// TODO: We should get rid of that it's causing too much issues
// Some relations can be null or undefined because they're not mendatory and other cannot
// This utility type put as defined all the joinColumn, so it's not well typed
export type ObjectRecord<T> = RecursiveObjectRecord<T> & ForeignKeyMap<T>;
