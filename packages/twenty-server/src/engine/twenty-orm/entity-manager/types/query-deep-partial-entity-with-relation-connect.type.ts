import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export type ConnectWhereValue = string | Record<string, string>;

export type ConnectWhere = Record<string, ConnectWhereValue>;

export type ConnectObject = {
  connect: {
    where: ConnectWhere;
  };
};

type EntityRelationFields<T> = {
  [K in keyof T]: T[K] extends BaseWorkspaceEntity | null ? K : never;
}[keyof T];

export type QueryDeepPartialEntityWithRelationConnect<T> = Omit<
  QueryDeepPartialEntity<T>,
  EntityRelationFields<T>
> & {
  [K in keyof T]?: T[K] extends BaseWorkspaceEntity | null
    ? T[K] | ConnectObject
    : T[K];
};
