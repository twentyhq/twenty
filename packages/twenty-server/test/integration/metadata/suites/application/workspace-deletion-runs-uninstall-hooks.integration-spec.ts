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
import { v4 as uuidv4 } from 'uuid';

// Type-only imports for container-resolved providers: value imports would pull
// the ESM-only file-type chain that the integration jest config cannot transform.
import { type ApplicationUninstallService } from 'src/engine/core-modules/application/application-manifest/services/application-uninstall.service';
import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { type WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

const buildManifestWithUninstallHook = ({
  appId,
  roleId,
  logicFunctionId,
}: {
  appId: string;
  roleId: string;
  logicFunctionId: string;
}): Manifest => {
  const baseManifest = buildBaseManifest({ appId, roleId });

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
  let appId: string;
  let roleId: string;
  let logicFunctionId: string;
  let userAccessToken: string;
  let executeSpy: jest.SpyInstance;

  beforeEach(() => {
    appId = uuidv4();
    roleId = uuidv4();
    logicFunctionId = uuidv4();

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

  afterEach(async () => {
    executeSpy.mockRestore();

    await globalThis.testDataSource.query(
      `DELETE FROM core."applicationRegistration" WHERE "universalIdentifier" = $1`,
      [appId],
    );

    // The hard deletion removes the user along with its last workspace; this
    // only cleans up when the test failed before reaching it.
    await deleteUser({ accessToken: userAccessToken });
  });

  it('runs pending hooks once through the enqueued job, then retries and the sweep skip the workspace', async () => {
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
      applicationUniversalIdentifier: appId,
      name: 'Workspace Deletion Hook Test App',
      description: 'App for testing uninstall hooks on workspace deletion',
      sourcePath: 'test-workspace-deletion-hook',
      token: workspaceAccessToken,
    });

    // setupApplicationForSync re-enables fake timers, which would freeze the
    // job-drain polling below.
    jest.useRealTimers();

    await syncApplication({
      manifest: buildManifestWithUninstallHook({
        appId,
        roleId,
        logicFunctionId,
      }),
      token: workspaceAccessToken,
      expectToFail: false,
    });

    const workspaceService =
      getAppProviderByClassName<WorkspaceService>('WorkspaceService');
    const applicationUninstallService =
      getAppProviderByClassName<ApplicationUninstallService>(
        'ApplicationUninstallService',
      );
    await workspaceService.deleteWorkspace(workspaceId, true);

    const [softDeletedWorkspace] = await globalThis.testDataSource.query(
      'SELECT "deletedAt" FROM core."workspace" WHERE id = $1',
      [workspaceId],
    );
    const workspaceDeletedAtIso = new Date(
      softDeletedWorkspace.deletedAt,
    ).toISOString();

    // The soft deletion enqueued the uninstall job; wait for the worker to run it.
    await waitForAllJobsToFinish();

    expect(executeSpy).toHaveBeenCalledTimes(1);
    expect(executeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId,
        workspaceDeletionRequestTimestamp: workspaceDeletedAtIso,
        logicFunctionId: expect.any(String),
        payload: {
          version: '1.0.0',
          idempotencyKey: `workspace-deletion:${workspaceId}:${workspaceDeletedAtIso}:${appId}`,
        },
      }),
    );

    const [applicationAfterHook] = await globalThis.testDataSource.query(
      `SELECT "uninstallHookCompletedForRequestedAt" FROM core."application"
       WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [appId, workspaceId],
    );

    expect(
      new Date(
        applicationAfterHook.uninstallHookCompletedForRequestedAt,
      ).toISOString(),
    ).toBe(workspaceDeletedAtIso);

    await applicationUninstallService.runUninstallHooksForWorkspaceDeletion({
      workspaceId,
      workspaceDeletedAt: new Date(workspaceDeletedAtIso),
    });

    expect(executeSpy).toHaveBeenCalledTimes(1);

    const workspaceIdsWithPendingUninstallHooks =
      await applicationUninstallService.findWorkspaceIdsWithPendingUninstallHooks(
        [
          {
            workspaceId,
            uninstallRequestedAt: new Date(workspaceDeletedAtIso),
          },
        ],
      );

    expect(workspaceIdsWithPendingUninstallHooks.size).toBe(0);

    await workspaceService.deleteWorkspace(workspaceId);

    expect(executeSpy).toHaveBeenCalledTimes(1);
  }, 120000);
});
