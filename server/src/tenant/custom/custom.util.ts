import { snakeCase } from 'src/utils/snake-case';

import { CustomEntityInput } from './args/custom-entity.input';
import {
  CustomEntityOrderByRelationInput,
  TypeORMSortOrder,
} from './args/custom-entity-order-by-relation.input';

export const getRawTypeORMWhereClause = (
  entity: string,
  where?: CustomEntityInput | undefined,
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
  orderBy?: CustomEntityOrderByRelationInput | undefined,
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
