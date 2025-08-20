import { type RELATION_NESTED_QUERY_KEYWORDS } from 'twenty-shared/constants';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { type BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export type ConnectWhereValue = string | Record<string, string>;

export type ConnectWhere = Record<string, ConnectWhereValue>;

export type ConnectObject = {
  [RELATION_NESTED_QUERY_KEYWORDS.CONNECT]: {
    [RELATION_NESTED_QUERY_KEYWORDS.CONNECT_WHERE]: ConnectWhere;
  };
};

export type DisconnectObject = {
  [RELATION_NESTED_QUERY_KEYWORDS.DISCONNECT]: true;
};

export type EntityRelationFields<T> = {
  [K in keyof T]: T[K] extends BaseWorkspaceEntity | null ? K : never;
}[keyof T];

export type QueryDeepPartialEntityWithNestedRelationFields<T> = Omit<
  QueryDeepPartialEntity<T>,
  EntityRelationFields<T>
> & {
  [K in keyof T]?: T[K] extends BaseWorkspaceEntity | null
    ? T[K] | ConnectObject | DisconnectObject
    : T[K];
};
