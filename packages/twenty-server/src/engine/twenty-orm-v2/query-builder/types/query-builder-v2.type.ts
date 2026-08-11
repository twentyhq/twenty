// Structural stand-ins for the TypeORM shapes the shared query parsers touch. They are
// declared here rather than imported so ORM v2 carries no typeorm import, while staying
// assignable from the values those parsers already build.

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

export type OrderByDirectionLike = 'ASC' | 'DESC';
export type OrderByNullsLike = 'NULLS FIRST' | 'NULLS LAST';

export type OrderByValueLike =
  | OrderByDirectionLike
  | {
      order?: OrderByDirectionLike;
      nulls?: OrderByNullsLike;
    };

export type OrderByConditionLike = Record<string, OrderByValueLike>;

export type FindOptionsSelectLike = Record<string, unknown>;

export type FindOptionsLike = {
  select?: FindOptionsSelectLike;
};

// The subset of QueryExpressionMap the shared parsers and permission utils read.
// ORM v2 populates it as it builds, instead of parsing it back out of generated SQL.
export type ExpressionMapLike = {
  queryType: 'select';
  joinAttributes: { alias: { name: string } }[];
  wheres: unknown[];
};
