import { Catch, UnauthorizedException } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

import { GraphQLError } from 'graphql';

@Catch()
export class ExceptionFilter implements GqlExceptionFilter {
  catch(exception: Error) {
    if (exception instanceof UnauthorizedException) {
      throw new GraphQLError('Unauthorized', {
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      });
    }

    return exception;
  }
}
