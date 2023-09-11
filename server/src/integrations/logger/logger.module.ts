import { DynamicModule, Global, ConsoleLogger } from '@nestjs/common';

import { LoggerDriver } from 'src/integrations/environment/interfaces/logger.interface';

import { LoggerService } from './logger.service';
import { LoggerModuleOptions } from './interfaces';
import { LOGGER_DRIVER } from './logger.constants';
import { LoggerModuleAsyncOptions } from './logger.module-definition';

import { SentryDriver } from './drivers/sentry.driver';

@Global()
export class LoggerModule {
  static forRoot(options: LoggerModuleOptions): DynamicModule {
    const provider = {
      provide: LOGGER_DRIVER,
      useValue:
        options.type === LoggerDriver.Console
          ? new ConsoleLogger()
          : new SentryDriver(options.options),
    };

    return {
      module: LoggerModule,
      providers: [LoggerService, provider],
      exports: [LoggerService],
    };
  }

  static forRootAsync(options: LoggerModuleAsyncOptions): DynamicModule {
    const provider = {
      provide: LOGGER_DRIVER,
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);
        return config?.type === LoggerDriver.Console
          ? new ConsoleLogger()
          : new SentryDriver(config.options);
      },
      inject: options.inject || [],
    };

    return {
      module: LoggerModule,
      imports: options.imports || [],
      providers: [LoggerService, provider],
      exports: [LoggerService],
    };
  }
}
