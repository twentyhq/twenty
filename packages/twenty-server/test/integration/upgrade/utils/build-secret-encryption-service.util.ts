import { isNonEmptyString } from '@sniptt/guards';

import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';

// Builds a SecretEncryptionService backed by the process.env keys, without
// pulling in the full NestJS DI container. Mirrors the production fallback
// chain: ENCRYPTION_KEY > APP_SECRET for the primary key and the optional
// FALLBACK_ENCRYPTION_KEY for rotation.
export const buildSecretEncryptionServiceFromEnv =
  (): SecretEncryptionService => {
    const appSecret = process.env.APP_SECRET;

    if (!isNonEmptyString(appSecret)) {
      throw new Error(
        'APP_SECRET must be set in the integration test environment to run encryption backfill suites.',
      );
    }

    const driver = {
      get: (key: string) => process.env[key],
    } as unknown as EnvironmentConfigDriver;

    return new SecretEncryptionService(driver);
  };
