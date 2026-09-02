import { isDefined } from 'class-validator';
import { RELATION_NESTED_QUERY_KEYWORDS } from 'twenty-shared/constants';

import {
  type ConnectObject,
  type CreateObject,
  type DisconnectObject,
} from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-nested-relation-fields.type';
import {
  type RelationConnectQueryFieldsByEntityIndex,
  type RelationCreateQueryFieldsByEntityIndex,
  type RelationDisconnectQueryFieldsByEntityIndex,
} from 'src/engine/twenty-orm/entity-manager/types/relation-nested-query-fields-by-entity-index.type';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

const hasRelationConnect = (value: unknown): value is ConnectObject => {
  if (!isDefined(value) || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (
    !isDefined(obj[RELATION_NESTED_QUERY_KEYWORDS.CONNECT]) ||
    typeof obj[RELATION_NESTED_QUERY_KEYWORDS.CONNECT] !== 'object'
  ) {
    return false;
  }

  const connect = obj[RELATION_NESTED_QUERY_KEYWORDS.CONNECT] as Record<
    string,
    unknown
  >;

  if (
    !isDefined(connect[RELATION_NESTED_QUERY_KEYWORDS.CONNECT_WHERE]) ||
    typeof connect[RELATION_NESTED_QUERY_KEYWORDS.CONNECT_WHERE] !== 'object'
  ) {
    return false;
  }

  const where = connect[RELATION_NESTED_QUERY_KEYWORDS.CONNECT_WHERE] as Record<
    string,
    unknown
  >;

  const whereKeys = Object.keys(where);

  if (whereKeys.length === 0) {
    return false;
  }

  return whereKeys.every((key) => {
    const whereValue = where[key];

    if (typeof whereValue === 'string') {
      return true;
    }
    if (whereValue && typeof whereValue === 'object') {
      const subObj = whereValue as Record<string, unknown>;

      return Object.values(subObj).every(
        (subValue) => typeof subValue === 'string',
      );
    }

    return false;
  });
};

const hasRelationDisconnect = (value: unknown): value is DisconnectObject => {
  if (!isDefined(value) || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (
    !isDefined(obj[RELATION_NESTED_QUERY_KEYWORDS.DISCONNECT]) ||
    typeof obj[RELATION_NESTED_QUERY_KEYWORDS.DISCONNECT] !== 'boolean'
  ) {
    return false;
  }

  return true;
};

const hasRelationCreate = (value: unknown): value is CreateObject => {
  if (!isDefined(value) || typeof value !== 'object') {
    return false;
  }

  const create = (value as Record<string, unknown>)[
    RELATION_NESTED_QUERY_KEYWORDS.CREATE
  ];

  return isDefined(create) && typeof create === 'object';
};

export const extractNestedRelationFieldsByEntityIndex = (
  entities: Record<string, unknown>[],
  relationFieldNames: ReadonlySet<string>,
): {
  relationConnectQueryFieldsByEntityIndex: RelationConnectQueryFieldsByEntityIndex;
  relationCreateQueryFieldsByEntityIndex: RelationCreateQueryFieldsByEntityIndex;
  relationDisconnectQueryFieldsByEntityIndex: RelationDisconnectQueryFieldsByEntityIndex;
} => {
  const relationConnectQueryFieldsByEntityIndex: RelationConnectQueryFieldsByEntityIndex =
    {};
  const relationDisconnectQueryFieldsByEntityIndex: RelationDisconnectQueryFieldsByEntityIndex =
    {};
  const relationCreateQueryFieldsByEntityIndex: RelationCreateQueryFieldsByEntityIndex =
    {};

  for (const [entityIndex, entity] of Object.entries(entities)) {
    for (const [key, value] of Object.entries(entity)) {
      if (!relationFieldNames.has(key)) {
        continue;
      }

      const hasConnect = hasRelationConnect(value);
      const hasCreate = hasRelationCreate(value);
      const hasDisconnect = hasRelationDisconnect(value);

      if (hasConnect && hasDisconnect) {
        throw new TwentyOrmException(
          `Cannot have both connect and disconnect for the same relation field ${key}.`,
          TwentyOrmExceptionCode.CONNECT_NOT_ALLOWED,
        );
      }

      if (hasCreate && (hasConnect || hasDisconnect)) {
        throw new TwentyOrmException(
          `Cannot combine create, connect, and disconnect for the same relation field ${key}.`,
          TwentyOrmExceptionCode.CONNECT_NOT_ALLOWED,
        );
      }

      const relationConnectQueryFields =
        relationConnectQueryFieldsByEntityIndex?.[entityIndex] || {};

      if (hasConnect) {
        relationConnectQueryFieldsByEntityIndex[entityIndex] = {
          ...relationConnectQueryFields,
          [key]: value,
        };
      }

      const relationDisconnectQueryFields =
        relationDisconnectQueryFieldsByEntityIndex?.[entityIndex] || {};

      if (hasDisconnect) {
        relationDisconnectQueryFieldsByEntityIndex[entityIndex] = {
          ...relationDisconnectQueryFields,
          [key]: value,
        };
      }

      const relationCreateQueryFields =
        relationCreateQueryFieldsByEntityIndex?.[entityIndex] || {};

      if (hasCreate) {
        relationCreateQueryFieldsByEntityIndex[entityIndex] = {
          ...relationCreateQueryFields,
          [key]: value,
        };
      }
    }
  }

  return {
    relationConnectQueryFieldsByEntityIndex,
    relationCreateQueryFieldsByEntityIndex,
    relationDisconnectQueryFieldsByEntityIndex,
  };
};
