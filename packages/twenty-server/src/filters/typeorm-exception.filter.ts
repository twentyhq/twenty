import { ArgumentsHost, Catch } from '@nestjs/common';
import { GqlContextType, GqlExceptionFilter } from '@nestjs/graphql';

import { TypeORMError } from 'typeorm';

import { BaseGraphQLError } from 'src/filters/utils/graphql-errors.util';

@Catch(TypeORMError)
export class TypeOrmExceptionFilter
  implements GqlExceptionFilter<TypeORMError, BaseGraphQLError | null>
{
  catch(exception: TypeORMError, host: ArgumentsHost) {
    if (host.getType<GqlContextType>() !== 'graphql') {
      return null;
    }

    const error = new BaseGraphQLError(exception.name, 'INTERNAL_SERVER_ERROR');

    error.stack = exception.stack;
    error.extensions['response'] = exception.message;

    return error;
  }
}
