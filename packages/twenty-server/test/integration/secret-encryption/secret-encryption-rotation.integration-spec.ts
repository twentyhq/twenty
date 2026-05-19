import crypto from 'crypto';

import gql from 'graphql-tag';
import { isDefined } from 'twenty-shared/utils';

import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

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
    runner = global.app.get(SecretEncryptionRotationRunnerService);
  });

  it('exposes the expected stable list of sites', () => {
    expect(runner.listSiteNames()).toEqual([
      'connected-account-tokens',
      'application-variable',
      'application-registration-variable',
      'signing-key-private-keys',
      'sensitive-config-storage',
      'totp-secrets',
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

      const findResponse = await makeMetadataAPIRequest({
        query: gql`
          query FindAppForRotationTestSetup($universalIdentifier: UUID!) {
            findOneApplication(universalIdentifier: $universalIdentifier) {
              id
            }
          }
        `,
        variables: { universalIdentifier: applicationUniversalIdentifier },
      });

      if (!isDefined(findResponse.body?.data?.findOneApplication?.id)) {
        throw new Error(
          `findOneApplication after sync did not return an id: ${JSON.stringify(
            findResponse.body,
          )}`,
        );
      }

      applicationId = findResponse.body.data.findOneApplication.id;

      const updateResponse = await makeMetadataAPIRequest({
        query: gql`
          mutation SetSecretForRotation(
            $key: String!
            $value: String!
            $applicationId: UUID!
          ) {
            updateOneApplicationVariable(
              key: $key
              value: $value
              applicationId: $applicationId
            )
          }
        `,
        variables: {
          key: ROTATION_VARIABLE_KEY,
          value: plaintext,
          applicationId,
        },
      });

      expect(updateResponse.body.errors).toBeUndefined();
    }, 120000);

    afterAll(async () => {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    });

    it('keeps the secret applicationVariable decryptable via GraphQL after running the rotation', async () => {
      await runner.run({ batchSize: 200, dryRun: false });

      const findResponse = await makeMetadataAPIRequest({
        query: gql`
          query ReadSecretAfterRotation($id: UUID!) {
            findOneApplication(id: $id) {
              applicationVariables {
                key
                value
                isSecret
              }
            }
          }
        `,
        variables: { id: applicationId },
      });

      expect(findResponse.body.errors).toBeUndefined();

      const variable =
        findResponse.body.data.findOneApplication.applicationVariables.find(
          (applicationVariable: { key: string }) =>
            applicationVariable.key === ROTATION_VARIABLE_KEY,
        );

      expect(variable).toBeDefined();
      expect(variable.isSecret).toBe(true);
      expect(variable.value).toBe(buildExpectedMask(plaintext));
    });
  });
});
