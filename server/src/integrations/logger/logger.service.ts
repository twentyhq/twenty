import {
  Inject,
  Injectable,
  LoggerService as ConsoleLoggerService,
} from '@nestjs/common';

import { LOGGER_DRIVER } from './logger.constants';

@Injectable()
export class LoggerService implements ConsoleLoggerService {
  constructor(@Inject(LOGGER_DRIVER) private driver: ConsoleLoggerService) {}

  log(message: any, ...optionalParams: any[]) {
    this.driver.log.apply(this.driver, [message, ...optionalParams]);
  }

  error(message: any, ...optionalParams: any[]) {
    this.driver.error.apply(this.driver, [message, ...optionalParams]);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.driver.warn.apply(this.driver, [message, ...optionalParams]);
  }

  debug?(message: any, ...optionalParams: any[]) {
    this.driver.debug?.apply(this.driver, [message, ...optionalParams]);
  }

  verbose?(message: any, ...optionalParams: any[]) {
    this.driver.verbose?.apply(this.driver, [message, ...optionalParams]);
  }
}
