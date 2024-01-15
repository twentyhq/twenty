import { Inject, Injectable } from '@nestjs/common';

import { ExceptionHandlerUser } from 'src/integrations/exception-handler/interfaces/exception-handler-user.interface';

import { ExceptionHandlerDriverInterface } from 'src/integrations/exception-handler/interfaces';
import { EXCEPTION_HANDLER_DRIVER } from 'src/integrations/exception-handler/exception-handler.constants';

@Injectable()
export class ExceptionHandlerService {
  constructor(
    @Inject(EXCEPTION_HANDLER_DRIVER)
    private driver: ExceptionHandlerDriverInterface,
  ) {}

  captureException(exception: unknown, user?: ExceptionHandlerUser) {
    this.driver.captureException(exception, user);
  }
}
