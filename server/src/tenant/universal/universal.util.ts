import { snakeCase } from 'src/utils/snake-case';

import { UniversalEntityInput } from './args/universal-entity.input';
import {
  UniversalEntityOrderByRelationInput,
  TypeORMSortOrder,
} from './args/universal-entity-order-by-relation.input';

export const getRawTypeORMWhereClause = (
  entity: string,
  where?: UniversalEntityInput | undefined,
) => {
  if (!where) {
    return {
      where: '',
      parameters: {},
    };
  }

  const { id, data, createdAt, updatedAt } = where;
  const flattenWhere: any = {
    ...(id ? { id } : {}),
    ...data,
    ...(createdAt ? { createdAt } : {}),
    ...(updatedAt ? { updatedAt } : {}),
  };

  return {
    where: Object.keys(flattenWhere)
      .map((key) => `${entity}.${snakeCase(key)} = :${key}`)
      .join(' AND '),
    parameters: flattenWhere,
  };
};

export const getRawTypeORMOrderByClause = (
  entity: string,
  orderBy?: UniversalEntityOrderByRelationInput | undefined,
) => {
  if (!orderBy) {
    return {};
  }

  const { id, data, createdAt, updatedAt } = orderBy;
  const flattenWhere: any = {
    ...(id ? { id } : {}),
    ...data,
    ...(createdAt ? { createdAt } : {}),
    ...(updatedAt ? { updatedAt } : {}),
  };

  const orderByClause: Record<string, TypeORMSortOrder> = {};

  for (const key of Object.keys(flattenWhere)) {
    orderByClause[`${entity}.${snakeCase(key)}`] = flattenWhere[key];
  }

  return orderByClause;
};
