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

import { SECRET_APPLICATION_VARIABLE_MASK } from 'src/engine/core-modules/application/application-variable/constants/secret-application-variable-mask.constant';

const ROTATION_VARIABLE_KEY = 'TEST_ROTATION_SECRET';

const buildExpectedMask = (plaintext: string): string => {
  const visibleCharsCount = Math.min(5, Math.floor(plaintext.length / 10));

  return `${plaintext.slice(0, visibleCharsCount)}${SECRET_APPLICATION_VARIABLE_MASK}`;
};

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
});
