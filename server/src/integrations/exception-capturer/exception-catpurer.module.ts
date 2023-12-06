import { DynamicModule, Global, Module } from '@nestjs/common';

import { ExceptionCapturerSentryDriver } from 'src/integrations/exception-capturer/drivers/sentry.driver';
import { ExceptionCapturerConsoleDriver } from 'src/integrations/exception-capturer/drivers/console.driver';

import { ExceptionCapturerService } from './exception-capturer.service';
import { ExceptionCapturerDriver } from './interfaces';
import { EXCEPTION_CAPTURER_DRIVER } from './exception-capturer.constants';
import {
  ConfigurableModuleClass,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} from './exception-capturer.module-definition';

@Global()
@Module({
  providers: [ExceptionCapturerService],
  exports: [ExceptionCapturerService],
})
export class ExceptionCapturerModule extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    const provider = {
      provide: EXCEPTION_CAPTURER_DRIVER,
      useValue:
        options.type === ExceptionCapturerDriver.Console
          ? new ExceptionCapturerConsoleDriver()
          : new ExceptionCapturerSentryDriver(options.options),
    };
    const dynamicModule = super.forRoot(options);

    return {
      ...dynamicModule,
      providers: [...(dynamicModule.providers ?? []), provider],
    };
  }

  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const provider = {
      provide: EXCEPTION_CAPTURER_DRIVER,
      useFactory: async (...args: any[]) => {
        const config = await options?.useFactory?.(...args);

        if (!config) {
          return null;
        }

        return config.type === ExceptionCapturerDriver.Console
          ? new ExceptionCapturerConsoleDriver()
          : new ExceptionCapturerSentryDriver(config.options);
      },
      inject: options.inject || [],
    };
    const dynamicModule = super.forRootAsync(options);

    return {
      ...dynamicModule,
      providers: [...(dynamicModule.providers ?? []), provider],
    };
  }
}
