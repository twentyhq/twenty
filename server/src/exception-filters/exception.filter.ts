import { Catch, HttpException } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';

@Catch()
export class ExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException) {
    if (exception instanceof Prisma.PrismaClientValidationError) {
      throw new GraphQLError('Invalid request', {
        extensions: {
          code: 'INVALID_REQUEST',
        },
      });
    }
    return exception;
  }
}
