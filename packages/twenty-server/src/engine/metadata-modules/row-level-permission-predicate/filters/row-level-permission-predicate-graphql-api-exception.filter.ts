/* @license Enterprise */

import { Catch, type ExceptionFilter } from '@nestjs/common';

import { RowLevelPermissionPredicateException } from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';
import { rowLevelPermissionPredicateGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/row-level-permission-predicate/utils/row-level-permission-predicate-graphql-api-exception-handler.util';

@Catch(RowLevelPermissionPredicateException)
export class RowLevelPermissionPredicateGraphqlApiExceptionFilter
  implements ExceptionFilter
{
  catch(exception: RowLevelPermissionPredicateException) {
    return rowLevelPermissionPredicateGraphqlApiExceptionHandler(exception);
  }
}
