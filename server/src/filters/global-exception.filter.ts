import { ArgumentsHost, Catch, Injectable } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

import { ExceptionCapturerService } from 'src/integrations/exception-capturer/exception-capturer.service';

@Catch()
@Injectable()
export class GlobalExceptionFilter implements GqlExceptionFilter {
  constructor(
    private readonly exceptionCapturerService: ExceptionCapturerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    this.exceptionCapturerService.captureException(exception);

    return exception;
  }
}
