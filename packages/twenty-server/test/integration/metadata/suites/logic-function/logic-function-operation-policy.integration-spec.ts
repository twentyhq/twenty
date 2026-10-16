import {
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { createOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/create-logic-function.util';
import { deleteLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/delete-logic-function.util';
import { getLogicFunctionSourceCode } from 'test/integration/metadata/suites/logic-function/utils/get-logic-function-source-code.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { v4 as uuidv4 } from 'uuid';

import { type OperationAuthorizationService } from 'src/engine/core-modules/authorization/services/operation-authorization.service';

describe('Logic function operation policies', () => {
  let installedApplication: ApplicationWithResources;
  let workspaceFunctionId: string;

  beforeAll(async () => {
    installedApplication = await setupApplicationWithResources({
      name: 'Operation Policy Installed Application',
    });

    const { data } = await createOneLogicFunction({
      input: { name: `workspace-function-${uuidv4()}` },
      expectToFail: false,
    });

    workspaceFunctionId = data.createOneLogicFunction.id;

    jest.useRealTimers();
  }, 180000);

  afterAll(async () => {
    await deleteLogicFunction({
      input: { id: workspaceFunctionId },
      expectToFail: false,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: installedApplication.universalIdentifier,
    });
  });

  describe('on workflow code steps', () => {
    let coreWorkflowId: string;
    let coreWorkflowVersionId: string;

    beforeAll(async () => {
      ({ coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
        name: 'Code step operation policy',
      }));

      await updateCoreWorkflowVersionTrigger({
        coreWorkflowVersionId,
        trigger: {
          name: 'Manual Trigger',
          type: 'MANUAL',
          settings: { outputSchema: {} },
          nextStepIds: [],
          position: { x: 0, y: 0 },
        },
      });
    });

    afterAll(async () => {
      await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    });

    it('should refuse an installed application creating a code step', async () => {
      const installedApplicationUserToken = (
        await generateAppleAdminApplicationTokenPair({
          applicationId: installedApplication.id,
        })
      ).applicationAccessToken.token;

      await expect(
        createCoreWorkflowVersionStep({
          coreWorkflowVersionId,
          stepType: 'CODE',
          token: installedApplicationUserToken,
        }),
      ).rejects.toThrow(/FORBIDDEN/);
    });
  });

  it('should evaluate the operation policy once for a GraphQL call', async () => {
    const isAllowedSpy = jest.spyOn(
      getAppProviderByClassName<OperationAuthorizationService>(
        'OperationAuthorizationService',
      ),
      'isAllowed',
    );

    try {
      const { errors } = await getLogicFunctionSourceCode({
        input: { id: workspaceFunctionId },
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(
        isAllowedSpy.mock.calls.filter(
          ([{ policy }]) => policy.name === 'logicFunction.readSource',
        ),
      ).toHaveLength(1);
    } finally {
      isAllowedSpy.mockRestore();
    }
  });
});
