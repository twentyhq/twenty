import {
  Inject,
  Injectable,
  LoggerService as ConsoleLoggerService,
} from '@nestjs/common';

import { LOGGER_DRIVER } from './logger.constants';

@Injectable()
export class LoggerService implements ConsoleLoggerService {
  constructor(@Inject(LOGGER_DRIVER) private driver: ConsoleLoggerService) {}

  log(message: any, category: string, ...optionalParams: any[]) {
    this.driver.log.apply(this.driver, [message, category, ...optionalParams]);
  }

  error(message: any, category: string, ...optionalParams: any[]) {
    this.driver.error.apply(this.driver, [
      message,
      category,
      ...optionalParams,
    ]);
  }

  warn(message: any, category: string, ...optionalParams: any[]) {
    this.driver.warn.apply(this.driver, [message, category, ...optionalParams]);
  }

  debug?(message: any, category: string, ...optionalParams: any[]) {
    this.driver.debug?.apply(this.driver, [
      message,
      category,
      ...optionalParams,
    ]);
  }

  verbose?(message: any, category: string, ...optionalParams: any[]) {
    this.driver.verbose?.apply(this.driver, [
      message,
      category,
      ...optionalParams,
    ]);
  }
}
