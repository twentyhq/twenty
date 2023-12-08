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

  switch (driverType) {
    case LoggerDriverType.Console: {
      return {
        type: LoggerDriverType.Console,
      };
    }
    default:
      throw new Error(
        `Invalid logger driver type (${driverType}), check your .env file`,
      );
  }
};
