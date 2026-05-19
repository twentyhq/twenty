import crypto from 'crypto';

import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  findOneApplicationIdByUniversalIdentifier,
  findOneApplicationVariables,
} from 'test/integration/secret-encryption/utils/find-one-application.util';
import { updateOneApplicationVariable } from 'test/integration/secret-encryption/utils/update-one-application-variable.util';

import { SECRET_ENCRYPTION_ROTATION_SITE_NAME } from 'src/database/commands/secret-encryption-rotation/constants/secret-encryption-rotation-site-name.constant';
import { SecretEncryptionRotationRunnerService } from 'src/database/commands/secret-encryption-rotation/services/secret-encryption-rotation-runner.service';
import { SECRET_APPLICATION_VARIABLE_MASK } from 'src/engine/core-modules/application/application-variable/constants/secret-application-variable-mask.constant';

const ROTATION_VARIABLE_KEY = 'TEST_ROTATION_SECRET';

const buildExpectedMask = (plaintext: string): string => {
  const visibleCharsCount = Math.min(5, Math.floor(plaintext.length / 10));

  return `${plaintext.slice(0, visibleCharsCount)}${SECRET_APPLICATION_VARIABLE_MASK}`;
};

describe('SecretEncryptionRotationRunnerService (integration)', () => {
  let runner: SecretEncryptionRotationRunnerService;

  beforeAll(() => {
    runner = global.app.get(SecretEncryptionRotationRunnerService, {
      strict: false,
    });
  });

  it('exposes the expected stable list of sites', () => {
    expect(runner.listSiteNames()).toEqual([
      SECRET_ENCRYPTION_ROTATION_SITE_NAME.CONNECTED_ACCOUNT_ACCESS_TOKEN,
      SECRET_ENCRYPTION_ROTATION_SITE_NAME.CONNECTED_ACCOUNT_REFRESH_TOKEN,
      SECRET_ENCRYPTION_ROTATION_SITE_NAME.APPLICATION_VARIABLE,
      SECRET_ENCRYPTION_ROTATION_SITE_NAME.APPLICATION_REGISTRATION_VARIABLE,
      SECRET_ENCRYPTION_ROTATION_SITE_NAME.SIGNING_KEY_PRIVATE_KEY,
      SECRET_ENCRYPTION_ROTATION_SITE_NAME.TOTP_SECRET,
      SECRET_ENCRYPTION_ROTATION_SITE_NAME.SENSITIVE_CONFIG_STORAGE,
    ]);
  });

  it('rejects an unknown --site value', async () => {
    await expect(
      runner.run({
        site: 'definitely-not-a-real-site',
        batchSize: 200,
        dryRun: false,
      }),
    ).rejects.toThrow(/Unknown rotation site/);
  });

  it('is idempotent: running twice in a row reports zero rotations on the second pass', async () => {
    const firstSummary = await runner.run({ batchSize: 200, dryRun: false });
    const secondSummary = await runner.run({ batchSize: 200, dryRun: false });

    const firstTotalErrors = firstSummary.results.reduce(
      (sum, result) => sum + result.errors,
      0,
    );
    const secondTotal = secondSummary.results.reduce(
      (sum, result) => sum + result.rotated,
      0,
    );
    const secondTotalErrors = secondSummary.results.reduce(
      (sum, result) => sum + result.errors,
      0,
    );

    expect(firstTotalErrors).toBe(0);
    expect(secondTotal).toBe(0);
    expect(secondTotalErrors).toBe(0);
  });

  describe('applicationVariable encrypted value round-trip', () => {
    let applicationUniversalIdentifier: string;
    let applicationId: string;
    const plaintext = 'secret-value-that-must-survive-key-rotation';

    beforeAll(async () => {
      applicationUniversalIdentifier = crypto.randomUUID();
      const roleUniversalIdentifier = crypto.randomUUID();

      await setupApplicationForSync({
        applicationUniversalIdentifier,
        name: 'Rotation Test Application',
        description: 'Verifies secret-encryption:rotate keeps secrets readable',
        sourcePath: 'test-secret-encryption-rotation',
      });

      await syncApplication({
        manifest: buildBaseManifest({
          appId: applicationUniversalIdentifier,
          roleId: roleUniversalIdentifier,
          overrides: {
            application: {
              universalIdentifier: applicationUniversalIdentifier,
              defaultRoleUniversalIdentifier: roleUniversalIdentifier,
              displayName: 'Rotation Test Application',
              description:
                'Verifies secret-encryption:rotate keeps secrets readable',
              applicationVariables: {
                [ROTATION_VARIABLE_KEY]: {
                  universalIdentifier: crypto.randomUUID(),
                  isSecret: true,
                },
              },
              packageJsonChecksum: null,
              yarnLockChecksum: null,
            },
          },
        }),
        expectToFail: false,
      });

      applicationId = await findOneApplicationIdByUniversalIdentifier({
        universalIdentifier: applicationUniversalIdentifier,
      });

      await updateOneApplicationVariable({
        key: ROTATION_VARIABLE_KEY,
        value: plaintext,
        applicationId,
      });
    }, 120000);

    afterAll(async () => {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    });

    it('keeps the secret applicationVariable decryptable via GraphQL after running the rotation', async () => {
      await runner.run({ batchSize: 200, dryRun: false });

      const variables = await findOneApplicationVariables({
        id: applicationId,
      });
      const variable = variables.find(
        (applicationVariable) =>
          applicationVariable.key === ROTATION_VARIABLE_KEY,
      );

      expect(variable).toBeDefined();
      expect(variable?.isSecret).toBe(true);
      expect(variable?.value).toBe(buildExpectedMask(plaintext));
    });
  });
});
