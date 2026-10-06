import { isNonEmptyString } from '@sniptt/guards';
import gql from 'graphql-tag';
import {
  activateCoreWorkflowVersion,
  CORE_WORKFLOW_MANUAL_TRIGGER,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  runCoreWorkflowVersion,
  updateCoreWorkflowVersionStepInput,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import {
  destroyWorkflowRun,
  waitForWorkflowCompletion,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { updateLogicFunctionSource } from 'test/integration/metadata/suites/logic-function/utils/update-logic-function-source.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { isDefined } from 'twenty-shared/utils';

import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

const EXTERNAL_PACKAGES_FUNCTION_CODE = `import groupBy from 'lodash.groupby';

export const main = async (params: { items: Array<{ category: string; name: string }> }): Promise<object> => {
  const grouped = groupBy(params.items, 'category');
  return {
    grouped,
    categories: Object.keys(grouped),
  };
};`;

describe('Code step workflow with PREBUILT logic function (e2e)', () => {
  let createdCoreWorkflowId: string | null = null;
  let createdCoreWorkflowVersionId: string | null = null;
  let codeStepId: string | null = null;
  let codeStepLogicFunctionId: string | null = null;
  let createdWorkflowRunId: string | null = null;

  beforeAll(async () => {
    const { coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
      name: 'Code Step PREBUILT Test',
    });

    createdCoreWorkflowId = coreWorkflowId;
    createdCoreWorkflowVersionId = coreWorkflowVersionId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: {
        ...CORE_WORKFLOW_MANUAL_TRIGGER,
        settings: {
          outputSchema: {
            items: { isLeaf: true, type: 'array', value: undefined },
          },
        },
      },
    });

    const codeStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'CODE',
    });

    expect(codeStep.type).toBe('CODE');
    codeStepId = codeStep.id;

    const { logicFunctionId } = codeStep.settings.input;

    if (!isNonEmptyString(logicFunctionId)) {
      throw new Error('Code step was created without a logic function');
    }

    codeStepLogicFunctionId = logicFunctionId;

    await updateCoreWorkflowVersionStepInput({
      coreWorkflowVersionId,
      step: codeStep,
      input: { logicFunctionInput: { items: '{{trigger.items}}' } },
    });

    const updateSourceResponse = await updateLogicFunctionSource({
      input: {
        id: logicFunctionId,
        update: {
          sourceHandlerCode: EXTERNAL_PACKAGES_FUNCTION_CODE,
        },
      },
      expectToFail: false,
    });

    expect(updateSourceResponse.errors).toBeUndefined();

    await activateCoreWorkflowVersion(coreWorkflowVersionId);
  });

  afterAll(async () => {
    if (isDefined(createdWorkflowRunId)) {
      await destroyWorkflowRun(createdWorkflowRunId);
    }

    if (isDefined(createdCoreWorkflowId)) {
      await deleteCoreWorkflows([createdCoreWorkflowId]);
    }
  });

  it('flips the underlying logic function to PREBUILT on workflow activation', async () => {
    const findLogicFunctionResponse = await makeMetadataApiRequest({
      query: gql`
        query FindOneLogicFunction($input: LogicFunctionIdInput!) {
          findOneLogicFunction(input: $input) {
            id
            executionMode
          }
        }
      `,
      variables: { input: { id: codeStepLogicFunctionId } },
    });

    expect(findLogicFunctionResponse.body.errors).toBeUndefined();

    const logicFunction =
      findLogicFunctionResponse.body.data.findOneLogicFunction;

    expect(logicFunction.executionMode).toBe(
      LogicFunctionExecutionMode.PREBUILT,
    );
  });

  it('runs the code step from its prebuilt bundle and resolves bare imports', async () => {
    createdWorkflowRunId = await runCoreWorkflowVersion({
      coreWorkflowVersionId: createdCoreWorkflowVersionId!,
      payload: {
        items: [
          { category: 'fruit', name: 'apple' },
          { category: 'vegetable', name: 'carrot' },
          { category: 'fruit', name: 'banana' },
        ],
      },
    });

    const workflowRun = await waitForWorkflowCompletion(createdWorkflowRunId);

    expect(workflowRun?.status).toBe('COMPLETED');
    expect(workflowRun?.state?.stepInfos?.trigger?.status).toBe('SUCCESS');
    expect(workflowRun?.state?.stepInfos?.[codeStepId!]?.status).toBe(
      'SUCCESS',
    );

    const stepResult = workflowRun?.state?.stepInfos?.[codeStepId!]?.result as
      | {
          grouped?: Record<string, Array<{ category: string; name: string }>>;
          categories?: string[];
        }
      | undefined;

    expect(stepResult?.grouped).toMatchObject({
      fruit: [
        { category: 'fruit', name: 'apple' },
        { category: 'fruit', name: 'banana' },
      ],
      vegetable: [{ category: 'vegetable', name: 'carrot' }],
    });
    expect(stepResult?.categories).toEqual(
      expect.arrayContaining(['fruit', 'vegetable']),
    );
  });
});
