import { ArgumentsHost, Catch } from '@nestjs/common';
import { GqlContextType, GqlExceptionFilter } from '@nestjs/graphql';

import { TypeORMError } from 'typeorm';

import { BaseGraphQLError } from 'src/filters/utils/graphql-errors.util';
import { ExceptionHandlerService } from 'src/integrations/exception-handler/exception-handler.service';

@Catch(TypeORMError)
export class TypeOrmExceptionFilter
  implements GqlExceptionFilter<TypeORMError, BaseGraphQLError | null>
{
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  catch(exception: TypeORMError, host: ArgumentsHost) {
    if (host.getType<GqlContextType>() !== 'graphql') {
      return null;
    }

    return this.catchException(exception);
  }

  catchException(exception: TypeORMError) {
    this.exceptionHandlerService.captureException(exception);

    const error = new BaseGraphQLError(exception.name, 'INTERNAL_SERVER_ERROR');

    error.stack = exception.stack;
    error.extensions['response'] = exception.message;

    return error;
  }
}
