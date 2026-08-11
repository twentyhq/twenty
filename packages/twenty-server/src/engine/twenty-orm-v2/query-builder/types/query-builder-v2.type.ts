export type WhereFactoryLike = {
  whereFactory: (queryBuilder: WhereExpressionLike) => void;
};

export type WhereExpressionLike = {
  where: (
    condition: string | WhereFactoryLike,
    parameters?: Record<string, unknown>,
  ) => WhereExpressionLike;
  andWhere: (
    condition: string | WhereFactoryLike,
    parameters?: Record<string, unknown>,
  ) => WhereExpressionLike;
  orWhere: (
    condition: string | WhereFactoryLike,
    parameters?: Record<string, unknown>,
  ) => WhereExpressionLike;
};

export const isWhereFactoryLike = (
  condition: unknown,
): condition is WhereFactoryLike =>
  typeof condition === 'object' &&
  condition !== null &&
  typeof (condition as WhereFactoryLike).whereFactory === 'function';

const NOT_BRACKETS_INSTANCE_SYMBOL = Symbol.for('NotBrackets');

export const isNegatedWhereFactoryLike = (condition: unknown): boolean =>
  isWhereFactoryLike(condition) &&
  (condition as { '@instanceof'?: symbol })['@instanceof'] ===
    NOT_BRACKETS_INSTANCE_SYMBOL;

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

export type ExpressionMapLike = {
  queryType: 'select';
  joinAttributes: {
    alias: { name: string };
    relation: { isOneToMany: boolean; isManyToMany: boolean };
  }[];
};
