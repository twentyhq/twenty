import {
  EmailDriverType,
  EmailModuleOptions,
} from 'src/integrations/email/interfaces/email.interface';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

export const emailModuleFactory = (
  environmentService: EnvironmentService,
): EmailModuleOptions => {
  const driverType = environmentService.getEmailDriverType();

  switch (driverType) {
    case EmailDriverType.Logger: {
      return;
    }
    case EmailDriverType.Smtp: {
      const host = environmentService.getEmailHost();
      const port = environmentService.getEmailPort();
      const user = environmentService.getEmailUser();
      const pass = environmentService.getEmailPassword();

      if (!(host && port)) {
        throw new Error(
          `${driverType} email driver requires host: ${host} and port: ${port} to be defined, check your .env file`,
        );
      }

      const auth = user && pass ? { user, pass } : undefined;

      if (auth) {
        return { host, port, auth };
      }

      return { host, port };
    }
    default:
      throw new Error(
        `Invalid email driver type(${driverType}), check your .env file`,
      );
  }
};
