import { Catch, Injectable } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

import { ExceptionHandlerService } from 'src/integrations/exception-handler/exception-handler.service';

@Catch()
@Injectable()
export class GlobalExceptionFilter implements GqlExceptionFilter {
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  catch(exception: unknown) {
    this.exceptionHandlerService.captureException(exception);

    return exception;
  }
}
