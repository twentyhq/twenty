import { ConfigService } from '@nestjs/config';

import { isNonEmptyString } from '@sniptt/guards';

import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';

export const buildSecretEncryptionServiceFromEnv =
  (): SecretEncryptionService => {
    const appSecret = process.env.APP_SECRET;

    if (!isNonEmptyString(appSecret)) {
      throw new Error(
        'APP_SECRET must be set in the integration test environment to run encryption backfill suites.',
      );
    }

    return new SecretEncryptionService(
      new EnvironmentConfigDriver(new ConfigService(), new ConfigVariables()),
    );
  };
