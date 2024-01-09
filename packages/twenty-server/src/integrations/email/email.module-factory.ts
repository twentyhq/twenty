import {
  EmailDriver,
  EmailModuleOptions,
} from 'src/integrations/email/interfaces/email.interface';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

export const emailModuleFactory = (
  environmentService: EnvironmentService,
): EmailModuleOptions => {
  const driver = environmentService.getEmailDriver();

  switch (driver) {
    case EmailDriver.Logger: {
      return;
    }
    case EmailDriver.Smtp: {
      const host = environmentService.getEmailHost();
      const port = environmentService.getEmailPort();
      const user = environmentService.getEmailUser();
      const pass = environmentService.getEmailPassword();

      if (!(host && port)) {
        throw new Error(
          `${driver} email driver requires host: ${host} and port: ${port} to be defined, check your .env file`,
        );
      }

      const auth = user && pass ? { user, pass } : undefined;

      if (auth) {
        return { host, port, auth };
      }

      return { host, port };
    }
    default:
      throw new Error(`Invalid email driver (${driver}), check your .env file`);
  }
};
