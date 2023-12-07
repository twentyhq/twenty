import { HttpAdapterHost } from '@nestjs/core';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { OPTIONS_TYPE } from 'src/integrations/exception-capturer/exception-capturer.module-definition';
import { ExceptionCapturerDriver } from 'src/integrations/exception-capturer/interfaces';

/**
 * ExceptionCapturer Module factory
 * @param environment
 * @returns ExceptionCapturerModuleOptions
 */
export const exceptionCapturerModuleFactory = async (
  environmentService: EnvironmentService,
  adapterHost: HttpAdapterHost,
): Promise<typeof OPTIONS_TYPE> => {
  const driverType = environmentService.getExceptionCapturerDriverType();

  switch (driverType) {
    case ExceptionCapturerDriver.Console: {
      return {
        type: ExceptionCapturerDriver.Console,
      };
    }
    case ExceptionCapturerDriver.Sentry: {
      return {
        type: ExceptionCapturerDriver.Sentry,
        options: {
          dns: environmentService.getSentryDSN() ?? '',
          serverInstance: adapterHost.httpAdapter.getInstance(),
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
