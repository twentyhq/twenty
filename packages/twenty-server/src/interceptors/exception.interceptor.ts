import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';

import { Observable, catchError, throwError } from 'rxjs';

import { handleException } from 'src/filters/utils/global-exception-handler.util';
import { ExceptionHandlerService } from 'src/integrations/exception-handler/exception-handler.service';
import { getRequest } from 'src/utils/extract-request';

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const request = getRequest(context);
        const user = request?.user?.user;

        handleException(error, this.exceptionHandlerService, user);

        return throwError(() => new InternalServerErrorException(error));
      }),
    );
  }
}
