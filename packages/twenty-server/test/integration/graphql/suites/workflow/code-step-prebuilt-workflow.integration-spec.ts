import gql from 'graphql-tag';
import request from 'supertest';
import {
  destroyWorkflowRun,
  runWorkflowVersion,
  waitForWorkflowCompletion,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';
import { updateLogicFunctionSource } from 'test/integration/metadata/suites/logic-function/utils/update-logic-function-source.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

const client = request(`http://localhost:${APP_PORT}`);

const EXTERNAL_PACKAGES_FUNCTION_CODE = `import groupBy from 'lodash.groupby';

export const main = async (params: { items: Array<{ category: string; name: string }> }): Promise<object> => {
  const grouped = groupBy(params.items, 'category');
  return {
    grouped,
    categories: Object.keys(grouped),
  };
};`;

describe('Code step workflow with PREBUILT logic function (e2e)', () => {
  let createdWorkflowId: string | null = null;
  let createdWorkflowVersionId: string | null = null;
  let codeStepId: string | null = null;
  let codeStepLogicFunctionId: string | null = null;
  let createdWorkflowRunId: string | null = null;

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_LOGIC_FUNCTION_PREBUILT_MODE_ENABLED,
      value: true,
      expectToFail: false,
    });

    const createWorkflowResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflow {
            createWorkflow(data: {
              name: "Code Step PREBUILT Test"
            }) {
              id
            }
          }
        `,
      });

    expect(createWorkflowResponse.body.errors).toBeUndefined();
    createdWorkflowId = createWorkflowResponse.body.data.createWorkflow.id;

    const getWorkflowResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query GetWorkflow($id: UUID!) {
            workflow(filter: { id: { eq: $id } }) {
              id
              versions {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        `,
        variables: { id: createdWorkflowId },
      });

    expect(getWorkflowResponse.body.errors).toBeUndefined();
    createdWorkflowVersionId =
      getWorkflowResponse.body.data.workflow.versions.edges[0].node.id;

    const manualTrigger = {
      name: 'Manual Trigger',
      type: 'MANUAL',
      settings: {
        outputSchema: {
          items: { isLeaf: true, type: 'array', value: undefined },
        },
      },
      nextStepIds: [],
      position: { x: 0, y: 0 },
    };

    const updateTriggerResponse = await updateWorkflowVersionTrigger({
      workflowVersionId: createdWorkflowVersionId!,
      trigger: manualTrigger,
    });

    expect(updateTriggerResponse.body.errors).toBeUndefined();

    const createCodeStepResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflowVersionStep($input: CreateWorkflowVersionStepInput!) {
            createWorkflowVersionStep(input: $input) {
              stepsDiff
            }
          }
        `,
        variables: {
          input: {
            workflowVersionId: createdWorkflowVersionId,
            stepType: 'CODE',
            parentStepId: 'trigger',
            position: { x: 200, y: 0 },
          },
        },
      });

    expect(createCodeStepResponse.body.errors).toBeUndefined();

    const getStepsResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query GetWorkflowVersion($id: UUID!) {
            workflowVersion(filter: { id: { eq: $id } }) {
              id
              steps
            }
          }
        `,
        variables: { id: createdWorkflowVersionId },
      });

    expect(getStepsResponse.body.errors).toBeUndefined();

    const codeStep = getStepsResponse.body.data.workflowVersion.steps.find(
      (step: { type: string }) => step.type === 'CODE',
    );

    expect(codeStep).toBeDefined();
    codeStepId = codeStep.id;

    const logicFunctionId = codeStep.settings.input.logicFunctionId;

    expect(logicFunctionId).toBeDefined();
    codeStepLogicFunctionId = logicFunctionId;

    const updateStepResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation UpdateWorkflowVersionStep($input: UpdateWorkflowVersionStepInput!) {
            updateWorkflowVersionStep(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            workflowVersionId: createdWorkflowVersionId,
            step: {
              ...codeStep,
              settings: {
                ...codeStep.settings,
                input: {
                  ...codeStep.settings.input,
                  logicFunctionInput: { items: '{{trigger.items}}' },
                },
              },
            },
          },
        },
      });

    expect(updateStepResponse.body.errors).toBeUndefined();

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

    const activateResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
            activateWorkflowVersion(workflowVersionId: $workflowVersionId)
          }
        `,
        variables: { workflowVersionId: createdWorkflowVersionId },
      });

    expect(activateResponse.body.errors).toBeUndefined();
    expect(activateResponse.body.data.activateWorkflowVersion).toBe(true);
  });

  afterAll(async () => {
    if (createdWorkflowRunId) {
      await destroyWorkflowRun(createdWorkflowRunId);
    }

    if (createdWorkflowId) {
      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation DestroyWorkflow($id: ID!) {
              destroyWorkflow(id: $id) {
                id
              }
            }
          `,
          variables: { id: createdWorkflowId },
        });
    }

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_LOGIC_FUNCTION_PREBUILT_MODE_ENABLED,
      value: false,
      expectToFail: false,
    });
  });

  it('flips the underlying logic function to PREBUILT on workflow activation', async () => {
    const findLogicFunctionResponse = await makeMetadataAPIRequest({
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
    createdWorkflowRunId = await runWorkflowVersion({
      workflowVersionId: createdWorkflowVersionId!,
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
