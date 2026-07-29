import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type Manifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

const buildManifestWithLogicFunction = ({
  appId,
  roleId,
  logicFunctionId,
  withUninstallHook,
}: {
  appId: string;
  roleId: string;
  logicFunctionId: string;
  withUninstallHook: boolean;
}): Manifest => {
  const baseManifest = buildBaseManifest({ appId, roleId });

  return {
    ...baseManifest,
    application: {
      ...baseManifest.application,
      ...(withUninstallHook
        ? { uninstallLogicFunction: { universalIdentifier: logicFunctionId } }
        : {}),
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

describe('Uninstall application logic function hook', () => {
  let appId: string;
  let roleId: string;
  let logicFunctionId: string;
  let executeSpy: jest.SpyInstance;

  beforeEach(async () => {
    appId = uuidv4();
    roleId = uuidv4();
    logicFunctionId = uuidv4();

    await setupApplicationForSync({
      applicationUniversalIdentifier: appId,
      name: 'Test Application',
      description: 'App for testing the uninstall logic function hook',
      sourcePath: 'test-uninstall-hook',
    });

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
  }, 60000);

  afterEach(async () => {
    executeSpy.mockRestore();

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: appId,
    });
  });

  it('executes the uninstall hook before deleting the application', async () => {
    await syncApplication({
      manifest: buildManifestWithLogicFunction({
        appId,
        roleId,
        logicFunctionId,
        withUninstallHook: true,
      }),
      expectToFail: false,
    });

    const { data, errors } = await uninstallApplication({
      universalIdentifier: appId,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data?.uninstallApplication).toBe(true);

    expect(executeSpy).toHaveBeenCalledTimes(1);
    expect(executeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: { version: '1.0.0' },
        logicFunctionId: expect.any(String),
      }),
    );
  }, 60000);

  it('does not execute any hook when the manifest declares no uninstall logic function', async () => {
    await syncApplication({
      manifest: buildManifestWithLogicFunction({
        appId,
        roleId,
        logicFunctionId,
        withUninstallHook: false,
      }),
      expectToFail: false,
    });

    const { data, errors } = await uninstallApplication({
      universalIdentifier: appId,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data?.uninstallApplication).toBe(true);

    expect(executeSpy).not.toHaveBeenCalled();
  }, 60000);

  it('uninstalls the application even when the uninstall hook returns an error (best-effort)', async () => {
    executeSpy.mockResolvedValue({
      data: null,
      duration: 1,
      logs: '',
      status: LogicFunctionExecutionStatus.ERROR,
      error: {
        errorType: 'UnhandledError',
        errorMessage: 'Uninstall hook failed on purpose',
        stackTrace: '',
      },
    });

    await syncApplication({
      manifest: buildManifestWithLogicFunction({
        appId,
        roleId,
        logicFunctionId,
        withUninstallHook: true,
      }),
      expectToFail: false,
    });

    const { data, errors } = await uninstallApplication({
      universalIdentifier: appId,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data?.uninstallApplication).toBe(true);
    expect(executeSpy).toHaveBeenCalledTimes(1);

    const applicationsAfterUninstall = await globalThis.testDataSource.query(
      `SELECT id FROM core."application" WHERE "universalIdentifier" = $1`,
      [appId],
    );

    expect(applicationsAfterUninstall).toHaveLength(0);
  }, 60000);
});
