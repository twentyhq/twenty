import { EnvironmentService } from 'src/integrations/environment/environment.service';
import {
  LoggerModuleOptions,
  LoggerDriverType,
} from 'src/integrations/logger/interfaces';

/**
 * Logger Module factory
 * @param environment
 * @returns LoggerModuleOptions
 */
export const loggerModuleFactory = async (
  environmentService: EnvironmentService,
): Promise<LoggerModuleOptions> => {
  const driverType = environmentService.getLoggerDriverType();
  const logLevels = environmentService.getLogLevels();

  switch (driverType) {
    case LoggerDriverType.Console: {
      return {
        type: LoggerDriverType.Console,
        logLevels: logLevels,
      };
    }
    default:
      throw new Error(
        `Invalid logger driver type (${driverType}), check your .env file`,
      );
  }
};
