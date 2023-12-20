import { Catch, Injectable } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

import { globalExceptionHandler } from 'src/filters/utils/global-exception-handler.util';
import { ExceptionHandlerService } from 'src/integrations/exception-handler/exception-handler.service';

@Catch()
@Injectable()
export class GlobalExceptionFilter implements GqlExceptionFilter {
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  catch(exception: unknown) {
    return globalExceptionHandler(exception, this.exceptionHandlerService);
  }
}
