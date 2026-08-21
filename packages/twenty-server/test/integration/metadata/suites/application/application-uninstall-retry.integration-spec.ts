import { randomUUID } from 'crypto';

import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type ApplicationUninstallService } from 'src/engine/core-modules/application/application-manifest/services/application-uninstall.service';
import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

type InstalledApplication = {
  universalIdentifier: string;
  uninstallLogicFunctionId: string;
  uninstallHookCompletedForRequestedAt: Date | null;
  workspaceId: string;
};

const SUCCESSFUL_EXECUTION_RESULT = {
  data: {},
  duration: 1,
  logs: '',
  status: LogicFunctionExecutionStatus.SUCCESS,
};

const FAILED_EXECUTION_RESULT = {
  data: null,
  duration: 1,
  logs: '',
  status: LogicFunctionExecutionStatus.ERROR,
  error: {
    errorType: 'Error',
    errorMessage: 'cleanup failed',
    stackTrace: '',
  },
};

const buildManifestWithUninstallHook = ({
  applicationUniversalIdentifier,
  roleUniversalIdentifier,
  logicFunctionUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  roleUniversalIdentifier: string;
  logicFunctionUniversalIdentifier: string;
}): Manifest => {
  const baseManifest = buildBaseManifest({
    appId: applicationUniversalIdentifier,
    roleId: roleUniversalIdentifier,
  });

  return {
    ...baseManifest,
    application: {
      ...baseManifest.application,
      uninstallLogicFunction: {
        universalIdentifier: logicFunctionUniversalIdentifier,
      },
    },
    logicFunctions: [
      {
        universalIdentifier: logicFunctionUniversalIdentifier,
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
    roles: baseManifest.roles.map((role) => ({
      ...role,
      label: `Retry Test Role ${applicationUniversalIdentifier}`,
    })),
  };
};

describe('Application uninstall retry', () => {
  const applicationUniversalIdentifiers = [uuidv4(), uuidv4()];
  let executeSpy: jest.SpyInstance;
  let userAccessToken: string;
  let workspaceAccessToken: string;
  let workspaceId: string;

  const findInstalledApplications = (): Promise<InstalledApplication[]> =>
    globalThis.testDataSource.query(
      `SELECT
         "universalIdentifier",
         "uninstallLogicFunctionId",
         "uninstallHookCompletedForRequestedAt",
         "workspaceId"
       FROM core."application"
       WHERE "universalIdentifier" = ANY($1::uuid[])`,
      [applicationUniversalIdentifiers],
    );

  beforeAll(async () => {
    const logicFunctionExecutorService =
      getAppProviderByClassName<LogicFunctionExecutorService>(
        'LogicFunctionExecutorService',
      );

    executeSpy = jest
      .spyOn(logicFunctionExecutorService, 'execute')
      .mockResolvedValue(SUCCESSFUL_EXECUTION_RESULT);

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

    workspaceId = newWorkspaceData.workspace.id;

    const {
      data: { getAuthTokensFromLoginToken: authTokensData },
    } = await getAuthTokensFromLoginToken({
      origin: newWorkspaceData.workspace.workspaceUrls.subdomainUrl,
      loginToken: newWorkspaceData.loginToken.token,
      expectToFail: false,
    });

    workspaceAccessToken =
      authTokensData.tokens.accessOrWorkspaceAgnosticToken.token;

    await activateWorkspace({
      accessToken: workspaceAccessToken,
      expectToFail: false,
    });

    for (const [
      index,
      applicationUniversalIdentifier,
    ] of applicationUniversalIdentifiers.entries()) {
      await setupApplicationForSync({
        applicationUniversalIdentifier,
        name: `Workspace Deletion Retry Test App ${index + 1}`,
        description: 'App for testing workspace deletion uninstall retries',
        sourcePath: `test-workspace-deletion-retry-${applicationUniversalIdentifier}`,
        token: workspaceAccessToken,
      });

      await syncApplication({
        manifest: buildManifestWithUninstallHook({
          applicationUniversalIdentifier,
          roleUniversalIdentifier: uuidv4(),
          logicFunctionUniversalIdentifier: uuidv4(),
        }),
        expectToFail: false,
        token: workspaceAccessToken,
      });
    }
  }, 120000);

  afterAll(async () => {
    executeSpy.mockResolvedValue(SUCCESSFUL_EXECUTION_RESULT);

    for (const applicationUniversalIdentifier of applicationUniversalIdentifiers) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }

    executeSpy.mockRestore();
    await deleteUser({ accessToken: userAccessToken });
  });

  it('records partial progress and retries only the failed hook', async () => {
    const workspaceDeletedAt = new Date('2026-08-18T10:00:00.000Z');
    const applicationUninstallService =
      getAppProviderByClassName<ApplicationUninstallService>(
        'ApplicationUninstallService',
      );
    const installedApplications = await findInstalledApplications();

    expect(installedApplications).toHaveLength(2);
    expect(
      new Set(
        installedApplications.map((application) => application.workspaceId),
      ).size,
    ).toBe(1);

    expect(installedApplications[0].workspaceId).toBe(workspaceId);

    executeSpy.mockClear();
    executeSpy
      .mockResolvedValueOnce(FAILED_EXECUTION_RESULT)
      .mockResolvedValueOnce(SUCCESSFUL_EXECUTION_RESULT);

    await expect(
      applicationUninstallService.runUninstallHooksForWorkspaceDeletion({
        workspaceId,
        workspaceDeletedAt,
      }),
    ).rejects.toThrow('cleanup failed');

    expect(executeSpy).toHaveBeenCalledTimes(2);

    const failedLogicFunctionId = executeSpy.mock.calls[0][0].logicFunctionId;
    const successfulLogicFunctionId =
      executeSpy.mock.calls[1][0].logicFunctionId;
    const failedApplication = installedApplications.find(
      (application) =>
        application.uninstallLogicFunctionId === failedLogicFunctionId,
    );
    const successfulApplication = installedApplications.find(
      (application) =>
        application.uninstallLogicFunctionId === successfulLogicFunctionId,
    );

    expect(failedApplication).toBeDefined();
    expect(successfulApplication).toBeDefined();

    if (!isDefined(failedApplication) || !isDefined(successfulApplication)) {
      throw new Error('Expected both uninstall applications to be installed');
    }

    const applicationsAfterFirstAttempt = await findInstalledApplications();
    const failedApplicationAfterFirstAttempt =
      applicationsAfterFirstAttempt.find(
        (application) =>
          application.universalIdentifier ===
          failedApplication.universalIdentifier,
      );
    const successfulApplicationAfterFirstAttempt =
      applicationsAfterFirstAttempt.find(
        (application) =>
          application.universalIdentifier ===
          successfulApplication.universalIdentifier,
      );

    expect(
      failedApplicationAfterFirstAttempt?.uninstallHookCompletedForRequestedAt,
    ).toBeNull();
    expect(
      successfulApplicationAfterFirstAttempt?.uninstallHookCompletedForRequestedAt?.toISOString(),
    ).toBe(workspaceDeletedAt.toISOString());

    const workspaceIdsWithPendingUninstallHooks =
      await applicationUninstallService.findWorkspaceIdsWithPendingUninstallHooks(
        [{ workspaceId, uninstallRequestedAt: workspaceDeletedAt }],
      );

    expect(workspaceIdsWithPendingUninstallHooks.size).toBe(1);
    expect(workspaceIdsWithPendingUninstallHooks.has(workspaceId)).toBe(true);

    executeSpy.mockClear();
    executeSpy.mockResolvedValue(SUCCESSFUL_EXECUTION_RESULT);

    await applicationUninstallService.runUninstallHooksForWorkspaceDeletion({
      workspaceId,
      workspaceDeletedAt,
    });

    expect(executeSpy).toHaveBeenCalledTimes(1);
    expect(executeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionId: failedApplication.uninstallLogicFunctionId,
        workspaceDeletionRequestTimestamp: workspaceDeletedAt.toISOString(),
        payload: expect.objectContaining({
          idempotencyKey: `workspace-deletion:${workspaceId}:${workspaceDeletedAt.toISOString()}:${failedApplication.universalIdentifier}`,
        }),
      }),
    );

    const applicationsAfterRetry = await findInstalledApplications();

    expect(
      applicationsAfterRetry.map((application) =>
        application.uninstallHookCompletedForRequestedAt?.toISOString(),
      ),
    ).toEqual([
      workspaceDeletedAt.toISOString(),
      workspaceDeletedAt.toISOString(),
    ]);

    const workspaceIdsWithPendingUninstallHooksAfterRetry =
      await applicationUninstallService.findWorkspaceIdsWithPendingUninstallHooks(
        [{ workspaceId, uninstallRequestedAt: workspaceDeletedAt }],
      );

    expect(workspaceIdsWithPendingUninstallHooksAfterRetry.size).toBe(0);
  }, 120000);
});
