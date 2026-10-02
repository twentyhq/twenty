import { InstanceChecker } from 'typeorm/util/InstanceChecker';

export type WhereFactoryLike = {
  whereFactory: (queryBuilder: WhereExpressionLike) => void;
};

export type ObjectWhereLike = Record<string, unknown>;

export type WhereConditionLike = string | WhereFactoryLike | ObjectWhereLike;

export type WhereExpressionLike = {
  where: (
    condition: WhereConditionLike,
    parameters?: Record<string, unknown>,
  ) => WhereExpressionLike;
  andWhere: (
    condition: WhereConditionLike,
    parameters?: Record<string, unknown>,
  ) => WhereExpressionLike;
  orWhere: (
    condition: WhereConditionLike,
    parameters?: Record<string, unknown>,
  ) => WhereExpressionLike;
};

export const isWhereFactoryLike = (
  condition: unknown,
): condition is WhereFactoryLike =>
  typeof condition === 'object' &&
  condition !== null &&
  typeof (condition as WhereFactoryLike).whereFactory === 'function';

// Compares prototype depth, not identity: an object from another realm (e.g. a test file) has its own Object.prototype
export const isObjectWhereLike = (
  condition: unknown,
): condition is ObjectWhereLike => {
  if (typeof condition !== 'object' || condition === null) {
    return false;
  }

  const prototype = Object.getPrototypeOf(condition);

  return prototype === null || Object.getPrototypeOf(prototype) === null;
};

export const isNegatedWhereFactoryLike = (condition: unknown): boolean =>
  isWhereFactoryLike(condition) && InstanceChecker.isNotBrackets(condition);

export type OrderByDirectionLike = 'ASC' | 'DESC';
export type OrderByNullsLike = 'NULLS FIRST' | 'NULLS LAST';

export type OrderByValueLike =
  | OrderByDirectionLike
  | {
      order?: OrderByDirectionLike;
      nulls?: OrderByNullsLike;
    };

export type OrderByConditionLike = Record<string, OrderByValueLike>;

export type FindOptionsSelectLike = Record<string, boolean>;

export type FindOptionsLike = {
  select?: FindOptionsSelectLike;
};
