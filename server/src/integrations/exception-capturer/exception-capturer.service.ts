import { Inject, Injectable } from '@nestjs/common';

import { ExceptionCapturerDriverInterface } from 'src/integrations/exception-capturer/interfaces';

import { EXCEPTION_CAPTURER_DRIVER } from './exception-capturer.constants';

@Injectable()
export class ExceptionCapturerService {
  constructor(
    @Inject(EXCEPTION_CAPTURER_DRIVER)
    private driver: ExceptionCapturerDriverInterface,
  ) {}

  captureException(exception: unknown) {
    this.driver.captureException(exception);
  }
}
