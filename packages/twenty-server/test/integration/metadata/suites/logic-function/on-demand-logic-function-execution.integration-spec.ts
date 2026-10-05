import { existsSync, rmSync } from 'fs';
import { join } from 'path';

import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { transferApplicationRegistrationOwnership } from 'test/integration/metadata/suites/application-registration/utils/transfer-application-registration-ownership.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { createOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/create-logic-function.util';
import { deleteLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/delete-logic-function.util';
import { executeLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/execute-logic-function.util';
import { findOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/find-one-logic-function.util';
import { getLogicFunctionSourceCode } from 'test/integration/metadata/suites/logic-function/utils/get-logic-function-source-code.util';
import { updateLogicFunctionSource } from 'test/integration/metadata/suites/logic-function/utils/update-logic-function-source.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { v4 as uuidv4 } from 'uuid';

import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const findCanRunOnDemand = async (logicFunctionId: string) => {
  const { data } = await findOneLogicFunction({
    input: { id: logicFunctionId },
    gqlFields: 'canRunOnDemand',
    expectToFail: false,
  });

  return data.findOneLogicFunction.canRunOnDemand;
};

describe('On-demand logic function execution from a session', () => {
  let installedApplication: ApplicationWithResources;
  let customLogicFunctionId: string;
  let workspaceCustomApplicationUniversalIdentifier: string;
  let executeSpy: jest.SpyInstance;

  beforeAll(async () => {
    installedApplication = await setupApplicationWithResources({
      name: 'Installed Application',
    });

    const { data: createData } = await createOneLogicFunction({
      input: { name: `custom-function-${uuidv4()}` },
      expectToFail: false,
    });

    customLogicFunctionId = createData.createOneLogicFunction.id;

    const { data: currentUserData } = await getCurrentUser({
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    const { currentWorkspace } = currentUserData.currentUser;

    jestExpectToBeDefined(currentWorkspace);

    workspaceCustomApplicationUniversalIdentifier =
      currentWorkspace.workspaceCustomApplicationId;
  }, 120000);

  beforeEach(() => {
    executeSpy = jest
      .spyOn(
        getAppProviderByClassName<LogicFunctionExecutorService>(
          'LogicFunctionExecutorService',
        ),
        'execute',
      )
      .mockResolvedValue({
        data: { ran: true },
        duration: 1,
        billedDurationMs: 1,
        logs: '',
        status: LogicFunctionExecutionStatus.SUCCESS,
      });
  });

  afterEach(() => {
    executeSpy.mockRestore();
  });

  afterAll(async () => {
    await deleteLogicFunction({
      input: { id: customLogicFunctionId },
      expectToFail: false,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: installedApplication.universalIdentifier,
    });
  });

  it('should run a function written in the workspace', async () => {
    const { data } = await executeLogicFunction({
      input: { id: customLogicFunctionId, payload: {} },
      expectToFail: false,
    });

    expect(data.executeOneLogicFunction.data).toEqual({ ran: true });
    expect(executeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ logicFunctionId: customLogicFunctionId }),
    );
    expect(await findCanRunOnDemand(customLogicFunctionId)).toBe(true);
  });

  it('should keep reading the source of a function written in the workspace', async () => {
    const { data } = await getLogicFunctionSourceCode({
      input: { id: customLogicFunctionId },
      expectToFail: false,
    });

    expect(data.getLogicFunctionSourceCode).toEqual(expect.any(String));
  });

  it('should run a function of an application whose registration the workspace owns', async () => {
    const { data } = await executeLogicFunction({
      input: { id: installedApplication.logicFunctionId, payload: {} },
      expectToFail: false,
    });

    expect(data.executeOneLogicFunction.data).toEqual({ ran: true });
    expect(executeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionId: installedApplication.logicFunctionId,
      }),
    );
    expect(await findCanRunOnDemand(installedApplication.logicFunctionId)).toBe(
      true,
    );
  });

  describe('with an installed application whose registration the workspace does not own', () => {
    beforeAll(async () => {
      await transferApplicationRegistrationOwnership({
        input: {
          applicationRegistrationId:
            installedApplication.applicationRegistrationId,
          targetWorkspaceSubdomain: 'yc',
        },
        expectToFail: false,
      });
    });

    it('should refuse to run a function that is not a workflow action', async () => {
      const { errors } = await executeLogicFunction({
        input: { id: installedApplication.logicFunctionId, payload: {} },
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
      expect(executeSpy).not.toHaveBeenCalled();
      expect(
        await findCanRunOnDemand(installedApplication.logicFunctionId),
      ).toBe(false);
    });

    it('should run a function exposed as a workflow action', async () => {
      const { data } = await executeLogicFunction({
        input: {
          id: installedApplication.workflowActionLogicFunctionId,
          payload: {},
        },
        expectToFail: false,
      });

      expect(data.executeOneLogicFunction.data).toEqual({ ran: true });
      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          logicFunctionId: installedApplication.workflowActionLogicFunctionId,
        }),
      );
      expect(
        await findCanRunOnDemand(
          installedApplication.workflowActionLogicFunctionId,
        ),
      ).toBe(true);
    });

    it('should refuse to read the function source from the custom application folder', async () => {
      const { errors } = await getLogicFunctionSourceCode({
        input: { id: installedApplication.logicFunctionId },
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });

    it('should refuse to write the function source into the custom application folder', async () => {
      const customApplicationSourcePath = join(
        process.cwd(),
        '.local-storage',
        SEED_APPLE_WORKSPACE_ID,
        workspaceCustomApplicationUniversalIdentifier,
        'source',
        'src/handler.ts',
      );

      rmSync(customApplicationSourcePath, { force: true });

      const { errors } = await updateLogicFunctionSource({
        input: {
          id: installedApplication.logicFunctionId,
          update: {
            sourceHandlerCode: 'export const handler = () => "overwritten";',
          },
        },
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
      expect(existsSync(customApplicationSourcePath)).toBe(false);
    });

    it('should refuse to delete the function', async () => {
      const { errors } = await deleteLogicFunction({
        input: { id: installedApplication.logicFunctionId },
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });

      const { data } = await findOneLogicFunction({
        input: { id: installedApplication.logicFunctionId },
        expectToFail: false,
      });

      expect(data.findOneLogicFunction.id).toBe(
        installedApplication.logicFunctionId,
      );
    });
  });
});
