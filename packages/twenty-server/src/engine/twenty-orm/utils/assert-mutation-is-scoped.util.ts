import { type QueryExpressionMap } from 'typeorm/query-builder/QueryExpressionMap';

import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

type AssertMutationIsScopedArgs = {
  expressionMap: QueryExpressionMap;
};

// Last-resort ORM-level net: a workspace delete/update/soft-delete/restore must
// never run without scope. It must be called BEFORE row-level-security
// predicates are applied so RLS-added predicates are not mistaken for
// caller-provided scope. To make that ordering robust against refactors, the
// mutation builders also call this as the first statement of
// `applyRowLevelPermissionPredicates`, so RLS can never be the sole scope of a
// mutation. Deep empty-filter detection (e.g. `{ name: {} }`) stays the API
// layer's job; here we only reject a structurally absent WHERE.
export const assertMutationIsScoped = ({
  expressionMap,
}: AssertMutationIsScopedArgs): void => {
  if (expressionMap.wheres.length === 0) {
    throw new TwentyORMException(
      'Refusing to execute an unscoped mutation: no WHERE clause was provided',
      TwentyORMExceptionCode.UNSCOPED_MUTATION,
    );
  }
};
