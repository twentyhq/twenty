import crypto from 'crypto';

import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  findOneApplicationIdByUniversalIdentifier,
  findOneApplicationVariables,
} from 'test/integration/secret-encryption/utils/find-one-application.util';
import { runSecretEncryptionRotationCommand } from 'test/integration/secret-encryption/utils/run-secret-encryption-rotation-command.util';
import { updateOneApplicationVariable } from 'test/integration/secret-encryption/utils/update-one-application-variable.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ApplicationVariableEntityService } from 'src/engine/core-modules/application/application-variable/application-variable.service';
import { SECRET_APPLICATION_VARIABLE_MASK } from 'src/engine/core-modules/application/application-variable/constants/secret-application-variable-mask.constant';
import { computeEncryptionKeyId } from 'src/engine/core-modules/secret-encryption/utils/compute-encryption-key-id.util';
import { encryptAesGcmV2 } from 'src/engine/core-modules/secret-encryption/utils/encrypt-aes-gcm-v2.util';
import { formatSecretEncryptionEnvelopeV2 } from 'src/engine/core-modules/secret-encryption/utils/format-secret-encryption-envelope-v2.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const ROTATION_VARIABLE_KEY = 'TEST_ROTATION_SECRET';
const PREVIOUS_ENCRYPTION_KEY = 'previous-encryption-key-retired-by-rotation';

const buildExpectedMask = (plaintext: string): string => {
  const visibleCharsCount = Math.min(5, Math.floor(plaintext.length / 10));

  return `${plaintext.slice(0, visibleCharsCount)}${SECRET_APPLICATION_VARIABLE_MASK}`;
};

const encryptWithPreviousEncryptionKey = (plaintext: string): string =>
  formatSecretEncryptionEnvelopeV2({
    keyId: computeEncryptionKeyId({ rawKey: PREVIOUS_ENCRYPTION_KEY }),
    payloadBase64: encryptAesGcmV2({
      plaintext,
      rawKey: PREVIOUS_ENCRYPTION_KEY,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    }),
  });

describe('secret-encryption:rotate command (integration)', () => {
  let applicationUniversalIdentifier: string;
  let applicationId: string;
  const plaintext = 'secret-value-that-must-survive-key-rotation';

  beforeAll(async () => {
    applicationUniversalIdentifier = crypto.randomUUID();
    const roleUniversalIdentifier = crypto.randomUUID();
    const roleLabel = `Rotation Test Role ${crypto.randomUUID()}`;

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
          roles: [
            {
              universalIdentifier: roleUniversalIdentifier,
              label: roleLabel,
              description: 'A role for the secret encryption rotation test',
            },
          ],
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
    await runSecretEncryptionRotationCommand();

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
  }, 60000);

  it('is idempotent: running rotation twice does not corrupt secrets', async () => {
    await runSecretEncryptionRotationCommand();
    await runSecretEncryptionRotationCommand();

    const variables = await findOneApplicationVariables({
      id: applicationId,
    });
    const variable = variables.find(
      (applicationVariable) =>
        applicationVariable.key === ROTATION_VARIABLE_KEY,
    );

    expect(variable?.value).toBe(buildExpectedMask(plaintext));
  }, 90000);

  it('refreshes the workspace cache so cached applicationVariables decrypt without the fallback key', async () => {
    await global.testDataSource.query(
      `UPDATE core."applicationVariable"
          SET "value" = $1
        WHERE "applicationId" = $2 AND "key" = $3`,
      [
        encryptWithPreviousEncryptionKey(plaintext),
        applicationId,
        ROTATION_VARIABLE_KEY,
      ],
    );
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'applicationVariableMaps',
    ]);

    await runSecretEncryptionRotationCommand(
      {},
      { FALLBACK_ENCRYPTION_KEY: PREVIOUS_ENCRYPTION_KEY },
    );

    await expect(
      getAppProviderByClassName<ApplicationVariableEntityService>(
        'ApplicationVariableEntityService',
      ).getServerEnvVariables({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId,
      }),
    ).resolves.toEqual({ [ROTATION_VARIABLE_KEY]: plaintext });
  }, 90000);
});
