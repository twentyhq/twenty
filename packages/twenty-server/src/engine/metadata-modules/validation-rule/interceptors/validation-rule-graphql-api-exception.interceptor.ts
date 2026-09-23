import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { type Observable, catchError } from 'rxjs';

import { validationRuleGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/validation-rule/utils/validation-rule-graphql-api-exception-handler.util';

@Injectable()
export class ValidationRuleGraphqlApiExceptionInterceptor
  implements NestInterceptor
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(catchError(validationRuleGraphqlApiExceptionHandler));
  }
}
