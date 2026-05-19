import { ConfigService } from '@nestjs/config';

import { DataSource } from 'typeorm';

import { buildSecretEncryptionServiceFromEnv } from 'test/integration/upgrade/utils/build-secret-encryption-service.util';

import { SensitiveConfigStorageRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/sensitive-config-storage-rotation.handler';
import { SecretEncryptionRotationRunnerService } from 'src/database/commands/secret-encryption-rotation/services/secret-encryption-rotation-runner.service';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { SigningKeyEntity } from 'src/engine/core-modules/jwt/entities/signing-key.entity';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';
import { TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export type SecretEncryptionRotationRunnerHarness = {
  runner: SecretEncryptionRotationRunnerService;
  dataSource: DataSource;
};

export const buildSecretEncryptionRotationRunnerFromEnv =
  async (): Promise<SecretEncryptionRotationRunnerHarness> => {
    const dataSource = new DataSource({
      type: 'postgres',
      url: process.env.PG_DATABASE_URL,
      schema: 'core',
      entities: [
        ApplicationRegistrationVariableEntity,
        ApplicationVariableEntity,
        ConnectedAccountEntity,
        KeyValuePairEntity,
        SigningKeyEntity,
        TwoFactorAuthenticationMethodEntity,
      ],
      synchronize: false,
    });

    await dataSource.initialize();

    const secretEncryptionService = buildSecretEncryptionServiceFromEnv();
    const environmentConfigDriver = new EnvironmentConfigDriver(
      new ConfigService(process.env),
      new ConfigVariables(),
    );

    const sensitiveConfigStorageRotationHandler =
      new SensitiveConfigStorageRotationHandler(
        dataSource.getRepository(KeyValuePairEntity),
        secretEncryptionService,
      );

    const runner = new SecretEncryptionRotationRunnerService(
      environmentConfigDriver,
      secretEncryptionService,
      sensitiveConfigStorageRotationHandler,
      dataSource.getRepository(ApplicationRegistrationVariableEntity),
      dataSource.getRepository(ApplicationVariableEntity),
      dataSource.getRepository(ConnectedAccountEntity),
      dataSource.getRepository(SigningKeyEntity),
      dataSource.getRepository(TwoFactorAuthenticationMethodEntity),
    );

    return { runner, dataSource };
  };
