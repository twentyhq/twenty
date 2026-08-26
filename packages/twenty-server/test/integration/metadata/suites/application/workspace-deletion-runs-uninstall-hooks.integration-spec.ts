import { randomUUID } from 'crypto';

import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { type WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { getWorkspaceApplicationUninstallLockName } from 'src/engine/core-modules/workspace/utils/get-workspace-application-uninstall-lock-name.util';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

const buildManifestWithUninstallHook = ({
  applicationUniversalIdentifier,
  roleId,
  logicFunctionId,
}: {
  applicationUniversalIdentifier: string;
  roleId: string;
  logicFunctionId: string;
}): Manifest => {
  const baseManifest = buildBaseManifest({
    appId: applicationUniversalIdentifier,
    roleId,
  });

  return {
    ...baseManifest,
    application: {
      ...baseManifest.application,
      uninstallLogicFunction: { universalIdentifier: logicFunctionId },
    },
    logicFunctions: [
      {
        universalIdentifier: logicFunctionId,
        name: 'Cleanup',
        description: 'Uninstall cleanup logic function',
        handlerName: 'handler',
        sourceHandlerPath: 'src/cleanup.ts',
        builtHandlerPath: 'dist/cleanup.mjs',
        builtHandlerChecksum: 'checksum-cleanup',
        httpRouteTriggerSettings: {
          path: '/cleanup',
          httpMethod: 'POST',
          isAuthRequired: true,
        },
      },
    ],
  };
};

describe('Workspace deletion runs application uninstall hooks', () => {
  let applicationUniversalIdentifier: string;
  let roleId: string;
  let logicFunctionId: string;
  let userAccessToken: string;
  let workspaceIdToCleanup: string | undefined;
  let executeSpy: jest.SpyInstance;

  beforeEach(() => {
    applicationUniversalIdentifier = uuidv4();
    roleId = uuidv4();
    logicFunctionId = uuidv4();
    workspaceIdToCleanup = undefined;

    const logicFunctionExecutorService =
      getAppProviderByClassName<LogicFunctionExecutorService>(
        'LogicFunctionExecutorService',
      );

    executeSpy = jest
      .spyOn(logicFunctionExecutorService, 'execute')
      .mockResolvedValue({
        data: {},
        duration: 1,
        logs: '',
        status: LogicFunctionExecutionStatus.SUCCESS,
      });
  });

  const createSoftDeletedWorkspaceWithApplication = async () => {
    jest.useRealTimers();

    const uniqueEmail = `test-${randomUUID()}@example.com`;
    const { data: signUpData } = await signUp({
      input: { email: uniqueEmail, password: 'Test123!@#' },
      expectToFail: false,
    });

    userAccessToken =
      signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

    await globalThis.testDataSource.query(
      'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
      [uniqueEmail],
    );

    const {
      data: { signUpInNewWorkspace: newWorkspaceData },
    } = await signUpInNewWorkspace({
      accessToken: userAccessToken,
      expectToFail: false,
    });
    const workspaceId = newWorkspaceData.workspace.id;

    workspaceIdToCleanup = workspaceId;

    const {
      data: { getAuthTokensFromLoginToken: authTokensData },
    } = await getAuthTokensFromLoginToken({
      origin: newWorkspaceData.workspace.workspaceUrls.subdomainUrl,
      loginToken: newWorkspaceData.loginToken.token,
      expectToFail: false,
    });
    const workspaceAccessToken =
      authTokensData.tokens.accessOrWorkspaceAgnosticToken.token;

    await activateWorkspace({
      accessToken: workspaceAccessToken,
      expectToFail: false,
    });

    await setupApplicationForSync({
      applicationUniversalIdentifier,
      name: 'Workspace Deletion Hook Test App',
      description: 'App for testing uninstall hooks on workspace deletion',
      sourcePath: `test-workspace-deletion-hook-${applicationUniversalIdentifier}`,
      token: workspaceAccessToken,
    });

    jest.useRealTimers();

    await syncApplication({
      manifest: buildManifestWithUninstallHook({
        applicationUniversalIdentifier,
        roleId,
        logicFunctionId,
      }),
      token: workspaceAccessToken,
      expectToFail: false,
    });

    const workspaceService =
      getAppProviderByClassName<WorkspaceService>('WorkspaceService');

    await workspaceService.deleteWorkspace(workspaceId, true);

    const [softDeletedWorkspace] = await globalThis.testDataSource.query(
      'SELECT "deletedAt" FROM core."workspace" WHERE id = $1',
      [workspaceId],
    );
    const workspaceDeletedAtIso = new Date(
      softDeletedWorkspace.deletedAt,
    ).toISOString();

    await waitForAllJobsToFinish();

    return { workspaceDeletedAtIso, workspaceId, workspaceService };
  };

  afterEach(async () => {
    try {
      if (isDefined(workspaceIdToCleanup)) {
        const [workspaceToCleanup] = await globalThis.testDataSource.query(
          'SELECT id FROM core."workspace" WHERE id = $1',
          [workspaceIdToCleanup],
        );

        if (isDefined(workspaceToCleanup)) {
          const workspaceService =
            getAppProviderByClassName<WorkspaceService>('WorkspaceService');

          await workspaceService.deleteWorkspace(workspaceIdToCleanup);
        }
      }

      await globalThis.testDataSource.query(
        `DELETE FROM core."applicationRegistration" WHERE "universalIdentifier" = $1`,
        [applicationUniversalIdentifier],
      );

      await deleteUser({ accessToken: userAccessToken });
    } finally {
      executeSpy.mockRestore();
    }
  });

  it('runs the uninstall hook through the enqueued deletion job and records completion', async () => {
    const { workspaceDeletedAtIso, workspaceId } =
      await createSoftDeletedWorkspaceWithApplication();

    expect(executeSpy).toHaveBeenCalledTimes(1);
    expect(executeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId,
        workspaceDeletionRequestTimestamp: workspaceDeletedAtIso,
        logicFunctionId: expect.any(String),
        payload: {
          version: '1.0.0',
          idempotencyKey: `workspace-deletion:${workspaceId}:${workspaceDeletedAtIso}:${applicationUniversalIdentifier}`,
        },
      }),
    );

    const [applicationAfterHook] = await globalThis.testDataSource.query(
      `SELECT "uninstallHookCompletedForRequestedAt" FROM core."application"
       WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [applicationUniversalIdentifier, workspaceId],
    );

    expect(
      new Date(
        applicationAfterHook.uninstallHookCompletedForRequestedAt,
      ).toISOString(),
    ).toBe(workspaceDeletedAtIso);
  }, 120000);

  it('defers hard deletion while the uninstall lock is held', async () => {
    const { workspaceId, workspaceService } =
      await createSoftDeletedWorkspaceWithApplication();

    const [workspaceMembershipBeforeDeferredHardDeletion] =
      await globalThis.testDataSource.query(
        `SELECT
           "userWorkspace".id AS "userWorkspaceId",
           "userWorkspace"."deletedAt" AS "userWorkspaceDeletedAt",
           "user".id AS "userId",
           "user"."deletedAt" AS "userDeletedAt"
         FROM core."userWorkspace" "userWorkspace"
         JOIN core."user" "user" ON "user".id = "userWorkspace"."userId"
         WHERE "userWorkspace"."workspaceId" = $1`,
        [workspaceId],
      );

    const postgresAdvisoryLockService =
      getAppProviderByClassName<PostgresAdvisoryLockService>(
        'PostgresAdvisoryLockService',
      );
    let releaseWorkspaceUninstallLock = () => {};
    let notifyWorkspaceUninstallLockAcquired = () => {};
    const workspaceUninstallLockAcquired = new Promise<void>((resolve) => {
      notifyWorkspaceUninstallLockAcquired = resolve;
    });
    const workspaceUninstallLockReleased = new Promise<void>((resolve) => {
      releaseWorkspaceUninstallLock = resolve;
    });
    const heldWorkspaceUninstallLock = postgresAdvisoryLockService.tryWithLock(
      getWorkspaceApplicationUninstallLockName(workspaceId),
      async () => {
        notifyWorkspaceUninstallLockAcquired();
        await workspaceUninstallLockReleased;
      },
    );

    await workspaceUninstallLockAcquired;

    try {
      await expect(
        workspaceService.deleteWorkspace(workspaceId),
      ).rejects.toThrow(
        `Cannot hard delete workspace ${workspaceId} while application uninstall is running`,
      );
    } finally {
      releaseWorkspaceUninstallLock();
      await heldWorkspaceUninstallLock;
    }

    const [workspaceAfterDeferredHardDeletion] =
      await globalThis.testDataSource.query(
        'SELECT id FROM core."workspace" WHERE id = $1',
        [workspaceId],
      );

    expect(workspaceAfterDeferredHardDeletion.id).toBe(workspaceId);

    const [workspaceMembershipAfterDeferredHardDeletion] =
      await globalThis.testDataSource.query(
        `SELECT
           "userWorkspace".id AS "userWorkspaceId",
           "userWorkspace"."deletedAt" AS "userWorkspaceDeletedAt",
           "user".id AS "userId",
           "user"."deletedAt" AS "userDeletedAt"
         FROM core."userWorkspace" "userWorkspace"
         JOIN core."user" "user" ON "user".id = "userWorkspace"."userId"
         WHERE "userWorkspace"."workspaceId" = $1`,
        [workspaceId],
      );

    expect(workspaceMembershipAfterDeferredHardDeletion).toEqual(
      workspaceMembershipBeforeDeferredHardDeletion,
    );

    await workspaceService.deleteWorkspace(workspaceId);

    expect(executeSpy).toHaveBeenCalledTimes(1);
  }, 120000);
});
