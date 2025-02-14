import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

import { ValidationError } from 'class-validator';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(ValidationError)
export class GraphqlValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationError, _host: ArgumentsHost) {
    const errors = Object.values(exception.constraints || {}).map((error) => ({
      message: error,
      path: exception.property,
    }));

    return new UserInputError(errors.map((error) => error.message).join(', '));
  }
}
