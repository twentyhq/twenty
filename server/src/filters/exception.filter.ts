import { Catch, UnauthorizedException } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';

@Catch()
export class ExceptionFilter implements GqlExceptionFilter {
  catch(exception: Error) {
    if (exception instanceof Prisma.PrismaClientValidationError) {
      throw new GraphQLError('Invalid request', {
        extensions: {
          code: 'INVALID_REQUEST',
        },
      });
    }
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
