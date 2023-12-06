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
): Promise<typeof OPTIONS_TYPE> => {
  const type = environmentService.getLoggerDriver();

  switch (type) {
    case ExceptionCapturerDriver.Console: {
      return {
        type: ExceptionCapturerDriver.Console,
      };
    }
    case ExceptionCapturerDriver.Sentry: {
      return {
        type: ExceptionCapturerDriver.Sentry,
        options: {
          sentryDNS: environmentService.getSentryDSN() ?? '',
        },
      };
    }
    default:
      throw new Error(
        `Invalid exception capturer type (${type}), check your .env file`,
      );
  }
};
