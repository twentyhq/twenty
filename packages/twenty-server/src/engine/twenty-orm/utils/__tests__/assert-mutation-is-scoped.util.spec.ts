import { type QueryExpressionMap } from 'typeorm/query-builder/QueryExpressionMap';
import { type WhereClause } from 'typeorm/query-builder/WhereClause';

import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { assertMutationIsScoped } from 'src/engine/twenty-orm/utils/assert-mutation-is-scoped.util';

const buildExpressionMap = (wheres: WhereClause[]): QueryExpressionMap =>
  ({ wheres }) as unknown as QueryExpressionMap;

const nonEmptyWheres = [
  { type: 'simple', condition: 'foo' },
] as unknown as WhereClause[];

describe('assertMutationIsScoped', () => {
  it('should pass when a WHERE clause is present', () => {
    expect(() =>
      assertMutationIsScoped({
        expressionMap: buildExpressionMap(nonEmptyWheres),
      }),
    ).not.toThrow();
  });

  it('should throw UNSCOPED_MUTATION when no WHERE clause was provided', () => {
    expect.assertions(2);

    try {
      assertMutationIsScoped({
        expressionMap: buildExpressionMap([]),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(TwentyORMException);
      expect((error as TwentyORMException).code).toBe(
        TwentyORMExceptionCode.UNSCOPED_MUTATION,
      );
    }
  });
});
