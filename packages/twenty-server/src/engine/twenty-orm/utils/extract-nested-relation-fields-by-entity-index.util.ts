import { isDefined } from 'class-validator';
import { RELATION_NESTED_QUERY_KEYWORDS } from 'twenty-shared/constants';

import {
  type ConnectObject,
  type DisconnectObject,
} from 'src/engine/twenty-orm/entity-manager/types/query-deep-partial-entity-with-nested-relation-fields.type';
import {
  type RelationConnectQueryFieldsByEntityIndex,
  type RelationDisconnectQueryFieldsByEntityIndex,
} from 'src/engine/twenty-orm/entity-manager/types/relation-nested-query-fields-by-entity-index.type';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
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
  if (!isDefined(value) || typeof value !== 'object') return false;

  const obj = value as Record<string, unknown>;

  if (
    !isDefined(obj[RELATION_NESTED_QUERY_KEYWORDS.DISCONNECT]) ||
    typeof obj[RELATION_NESTED_QUERY_KEYWORDS.DISCONNECT] !== 'boolean'
  )
    return false;

  return true;
};

export const extractNestedRelationFieldsByEntityIndex = (
  entities: Record<string, unknown>[],
): {
  relationConnectQueryFieldsByEntityIndex: RelationConnectQueryFieldsByEntityIndex;
  relationDisconnectQueryFieldsByEntityIndex: RelationDisconnectQueryFieldsByEntityIndex;
} => {
  const relationConnectQueryFieldsByEntityIndex: RelationConnectQueryFieldsByEntityIndex =
    {};
  const relationDisconnectQueryFieldsByEntityIndex: RelationDisconnectQueryFieldsByEntityIndex =
    {};

  for (const [entityIndex, entity] of Object.entries(entities)) {
    for (const [key, value] of Object.entries(entity)) {
      const hasConnect = hasRelationConnect(value);
      const hasDisconnect = hasRelationDisconnect(value);

      if (hasConnect && hasDisconnect) {
        throw new TwentyORMException(
          `Cannot have both connect and disconnect for the same field on ${entity.key}.`,
          TwentyORMExceptionCode.CONNECT_NOT_ALLOWED,
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
    }
  }

  return {
    relationConnectQueryFieldsByEntityIndex,
    relationDisconnectQueryFieldsByEntityIndex,
  };
};
