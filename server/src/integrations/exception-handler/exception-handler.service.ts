import { Inject, Injectable } from '@nestjs/common';

import { ExceptionHandlerDriverInterface } from 'src/integrations/exception-handler/interfaces';

import { EXCEPTION_HANDLER_DRIVER } from './exception-handler.constants';

@Injectable()
export class ExceptionHandlerService {
  constructor(
    @Inject(EXCEPTION_HANDLER_DRIVER)
    private driver: ExceptionHandlerDriverInterface,
  ) {}

  captureException(exception: unknown) {
    this.driver.captureException(exception);
  }
}
