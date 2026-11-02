import { randomUUID } from 'crypto';

import IORedis from 'ioredis';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { expectPermissionDenied } from 'test/integration/metadata/suites/application/utils/expect-permission-denied.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { myApplicationPreferences } from 'test/integration/metadata/suites/application/utils/my-application-preferences.util';
import { runMyApplicationHealthCheckQueryFactory } from 'test/integration/metadata/suites/application/utils/run-my-application-health-check-query-factory.util';
import { runMyApplicationHealthCheck } from 'test/integration/metadata/suites/application/utils/run-my-application-health-check.util';
import {
  type ApplicationWithUserHealthCheck,
  setupApplicationWithUserHealthCheck,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-user-health-check.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { isDefined } from 'twenty-shared/utils';

import { USER_HEALTH_CHECK_RATE_LIMIT_MAX } from 'src/engine/core-modules/application/application-health/constants/user-health-check-rate-limit.constant';
import { buildUserHealthCheckRateLimitKey } from 'src/engine/core-modules/application/application-health/utils/build-user-health-check-rate-limit-key.util';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TOKEN_BUCKET_THROTTLE_KEY_PREFIX } from 'src/engine/core-modules/throttler/constants/token-bucket-throttle-key-prefix.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const UNINSTALLED_APPLICATION_ID = '9f1b7c2e-4d3a-4b5c-8e6f-0a1b2c3d4e5f';

describe('My application preferences should fail', () => {
  let application: ApplicationWithVariable;
  let janeApplicationToken: string;

  beforeAll(async () => {
    application = await setupApplicationWithVariable({
      name: 'Application Preferences Caller Application',
      variableKey: 'RECORD_MY_MEETINGS',
      variableScope: 'USER',
    });

    const janeApplicationTokenPair =
      await generateAppleAdminApplicationTokenPair({
        applicationId: application.id,
      });

    janeApplicationToken =
      janeApplicationTokenPair.applicationAccessToken.token;
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
  });

  it('should refuse an API key', async () => {
    const { errors } = await myApplicationPreferences({
      input: {},
      token: API_KEY_ACCESS_TOKEN,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should refuse an application token, even one a member is behind', async () => {
    const { errors } = await myApplicationPreferences({
      input: {},
      token: janeApplicationToken,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should refuse a guest whose role lacks the User Apps permission', async () => {
    const { data, errors } = await myApplicationPreferences({
      input: {},
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
      expectToFail: true,
    });

    expect(data).toBeNull();
    expectPermissionDenied(errors);
  });

  describe('when running my application health check', () => {
    it('should refuse an API key', async () => {
      const { errors } = await runMyApplicationHealthCheck({
        input: { applicationId: application.id },
        token: API_KEY_ACCESS_TOKEN,
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });

    it('should refuse an application token, even one a member is behind', async () => {
      const { errors } = await runMyApplicationHealthCheck({
        input: { applicationId: application.id },
        token: janeApplicationToken,
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });

    it('should refuse a guest whose role lacks the User Apps permission', async () => {
      const { data, errors } = await runMyApplicationHealthCheck({
        input: { applicationId: application.id },
        token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
        expectToFail: true,
      });

      expect(data.runMyApplicationHealthCheck).toBeNull();
      expectPermissionDenied(errors);
    });

    it('should not find an application that is not installed in the workspace', async () => {
      const { errors } = await runMyApplicationHealthCheck({
        input: { applicationId: UNINSTALLED_APPLICATION_ID },
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });

    describe('past the rate limit', () => {
      let applicationWithUserHealthCheck: ApplicationWithUserHealthCheck;

      const clearJonyRateLimitBucket = async (): Promise<void> => {
        const redis = new IORedis(
          process.env.REDIS_URL ?? 'redis://localhost:6379',
        );
        const rateLimitKey = buildUserHealthCheckRateLimitKey({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
          applicationId: applicationWithUserHealthCheck.id,
        });

        try {
          await redis.del(
            `${CacheStorageNamespace.IntegrationTests}:${CacheStorageNamespace.EngineWorkspace}:${TOKEN_BUCKET_THROTTLE_KEY_PREFIX}:${rateLimitKey}`,
          );
        } finally {
          redis.disconnect();
        }
      };

      beforeAll(async () => {
        applicationWithUserHealthCheck =
          await setupApplicationWithUserHealthCheck({
            name: 'Application with a rate limited user health check',
          });
        await clearJonyRateLimitBucket();
      }, 120000);

      afterAll(async () => {
        await clearJonyRateLimitBucket();
        await cleanupApplicationAndAppRegistration({
          applicationUniversalIdentifier:
            applicationWithUserHealthCheck.universalIdentifier,
        });
      });

      it('should refuse a member once their bucket for the application is spent', async () => {
        const responses = await Promise.all(
          Array.from({ length: USER_HEALTH_CHECK_RATE_LIMIT_MAX + 1 }, () =>
            makeMetadataApiRequest(
              runMyApplicationHealthCheckQueryFactory({
                input: { applicationId: applicationWithUserHealthCheck.id },
              }),
              APPLE_JONY_MEMBER_ACCESS_TOKEN,
            ),
          ),
        );

        const refusedResponses = responses.filter(({ body }) =>
          isDefined(body.errors),
        );

        expect(responses.length - refusedResponses.length).toBe(
          USER_HEALTH_CHECK_RATE_LIMIT_MAX,
        );
        expect(refusedResponses).toHaveLength(1);
        expectOneNotInternalServerErrorSnapshot({
          errors: refusedResponses[0].body.errors,
        });
      });
    });
  });

  describe('for a member whose role lacks the User Apps permission', () => {
    let memberRoleId: string;
    let customRoleId: string;

    beforeAll(async () => {
      const memberRole = await findOneRoleByLabel({ label: 'Member' });

      memberRoleId = memberRole.id;

      const { data } = await createOneRole({
        expectToFail: false,
        input: {
          label: `Application preferences denied role ${randomUUID()}`,
          description: 'Member role without the User Apps permission',
          icon: 'IconUser',
          canUpdateAllSettings: false,
          canAccessAllTools: false,
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          canBeAssignedToUsers: true,
          canBeAssignedToAgents: false,
          canBeAssignedToApiKeys: false,
        },
      });

      const createdRoleId = data?.createOneRole?.id;

      jestExpectToBeDefined(createdRoleId);
      customRoleId = createdRoleId;

      await updateWorkspaceMemberRole({
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          roleId: customRoleId,
        },
        expectToFail: false,
      });
    });

    afterAll(async () => {
      await updateWorkspaceMemberRole({
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          roleId: memberRoleId,
        },
        expectToFail: false,
      });
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: customRoleId },
      });
    });

    it('should refuse the member', async () => {
      const { data, errors } = await myApplicationPreferences({
        input: {},
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        expectToFail: true,
      });

      expect(data).toBeNull();
      expectPermissionDenied(errors);
    });
  });
});
