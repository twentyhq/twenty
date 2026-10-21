import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { transferApplicationRegistrationOwnership } from 'test/integration/metadata/suites/application-registration/utils/transfer-application-registration-ownership.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

describe('Workflow code step running an installed application function', () => {
  let installedApplication: ApplicationWithResources;
  let executeSpy: jest.SpyInstance;

  beforeAll(async () => {
    installedApplication = await setupApplicationWithResources({
      name: 'Code Step Target Application',
    });

    jest.useRealTimers();

    await transferApplicationRegistrationOwnership({
      input: {
        applicationRegistrationId:
          installedApplication.applicationRegistrationId,
        targetWorkspaceSubdomain: 'yc',
      },
      expectToFail: false,
    });
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
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: installedApplication.universalIdentifier,
    });
  });

  it('should fail the step for a function that is not a workflow action', async () => {
    const { status, stepStatus, stepError } = await runWorkflowActionStep({
      name: 'Code step running a non workflow action function',
      stepType: 'CODE',
      input: {
        logicFunctionId: installedApplication.logicFunctionId,
        logicFunctionInput: { chosenBy: 'workflow author' },
      },
    });

    expect(status).toBe('FAILED');
    expect(stepStatus).toBe('FAILED');
    expect(stepError).toBe(
      'Only logic functions written in this workspace or exposed as workflow actions can be run on demand',
    );
    expect(executeSpy).not.toHaveBeenCalled();
  });

  it('should run a function exposed as a workflow action', async () => {
    const { status, stepStatus, stepResult } = await runWorkflowActionStep({
      name: 'Code step running a workflow action function',
      stepType: 'CODE',
      input: {
        logicFunctionId: installedApplication.workflowActionLogicFunctionId,
        logicFunctionInput: { chosenBy: 'workflow author' },
      },
    });

    expect(status).toBe('COMPLETED');
    expect(stepStatus).toBe('SUCCESS');
    expect(stepResult).toEqual({ ran: true });
    expect(executeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionId: installedApplication.workflowActionLogicFunctionId,
        payload: { chosenBy: 'workflow author' },
      }),
    );
  });
});
