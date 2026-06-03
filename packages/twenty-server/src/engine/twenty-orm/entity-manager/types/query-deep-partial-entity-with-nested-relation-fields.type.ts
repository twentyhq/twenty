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

// Captures both to-one (BaseWorkspaceEntity | null) and to-many
// (BaseWorkspaceEntity[]) relation fields. To-many fields must be included so
// they are stripped from TypeORM's QueryDeepPartialEntity half below; otherwise
// they get intersected with TypeORM's `() => string` raw-SQL escape hatch,
// producing an unsatisfiable type for plain relation arrays.
export type EntityRelationFields<T> = {
  [K in keyof T]: NonNullable<T[K]> extends BaseWorkspaceEntity | BaseWorkspaceEntity[]
    ? K
    : never;
}[keyof T];

export type QueryDeepPartialEntityWithNestedRelationFields<T> = Omit<
  QueryDeepPartialEntity<T>,
  EntityRelationFields<T>
> & {
  [K in keyof T]?: T[K] extends BaseWorkspaceEntity | null
    ? T[K] | ConnectObject | DisconnectObject
    : T[K];
};
