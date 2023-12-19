import { HttpAdapterHost } from '@nestjs/core';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { OPTIONS_TYPE } from 'src/integrations/exception-handler/exception-handler.module-definition';
import { ExceptionHandlerDriver } from 'src/integrations/exception-handler/interfaces';

/**
 * ExceptionHandler Module factory
 * @param environment
 * @returns ExceptionHandlerModuleOptions
 */
export const exceptionHandlerModuleFactory = async (
  environmentService: EnvironmentService,
  adapterHost: HttpAdapterHost,
): Promise<typeof OPTIONS_TYPE> => {
  const driverType = environmentService.getExceptionHandlerDriverType();

  switch (driverType) {
    case ExceptionHandlerDriver.Console: {
      return {
        type: ExceptionHandlerDriver.Console,
      };
    }
    case ExceptionHandlerDriver.Sentry: {
      return {
        type: ExceptionHandlerDriver.Sentry,
        options: {
          dns: environmentService.getSentryDSN() ?? '',
          serverInstance: adapterHost.httpAdapter?.getInstance(),
          debug: environmentService.isDebugMode(),
        },
      };
    }
    default:
      throw new Error(
        `Invalid exception capturer driver type (${driverType}), check your .env file`,
      );
  }
};
