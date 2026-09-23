import gql from 'graphql-tag';
import request from 'supertest';

import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';
import {
  destroyWorkflowRun,
  waitForWorkflowCompletion,
  type WorkflowRunStatusType,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type WorkflowVersionStep = {
  id: string;
  type: string;
  settings: { input: Record<string, unknown> };
};

export type WebhookTriggeredActionStepRun = {
  status?: WorkflowRunStatusType;
  stepStatus?: string;
  stepResult?: Record<string, unknown>;
  stepError?: string;
};

export const runWebhookTriggeredActionStep = async ({
  name,
  stepType,
  input,
}: {
  name: string;
  stepType: 'SEND_EMAIL' | 'DRAFT_EMAIL';
  input: Record<string, unknown>;
}): Promise<WebhookTriggeredActionStepRun> => {
  const createWorkflowResponse = await makeGraphqlAPIRequest({
    query: gql`
      mutation CreateWorkflow($name: String!) {
        createWorkflow(data: { name: $name }) {
          id
        }
      }
    `,
    variables: { name },
  });

  expect(createWorkflowResponse.body.errors).toBeUndefined();

  const workflowId = createWorkflowResponse.body.data.createWorkflow.id;

  let workflowRunId: string | undefined;

  try {
    const workflowVersionsResponse = await makeGraphqlAPIRequest({
      query: gql`
        query FindDraftWorkflowVersion($workflowId: UUID!) {
          workflowVersions(
            filter: {
              workflowId: { eq: $workflowId }
              status: { in: ["DRAFT"] }
            }
          ) {
            edges {
              node {
                id
              }
            }
          }
        }
      `,
      variables: { workflowId },
    });

    expect(workflowVersionsResponse.body.errors).toBeUndefined();

    const workflowVersionId =
      workflowVersionsResponse.body.data.workflowVersions.edges[0].node.id;

    await updateWorkflowVersionTrigger({
      workflowVersionId,
      trigger: {
        name: 'Webhook Trigger',
        type: 'WEBHOOK',
        settings: {
          outputSchema: {},
          httpMethod: 'GET',
          authentication: null,
        },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    const createStepResponse = await makeGraphqlAPIRequest({
      query: gql`
        mutation CreateWorkflowVersionStep(
          $input: CreateWorkflowVersionStepInput!
        ) {
          createWorkflowVersionStep(input: $input) {
            stepsDiff
          }
        }
      `,
      variables: {
        input: {
          workflowVersionId,
          stepType,
          parentStepId: 'trigger',
          position: { x: 200, y: 0 },
        },
      },
    });

    expect(createStepResponse.body.errors).toBeUndefined();

    const stepsResponse = await makeGraphqlAPIRequest({
      query: gql`
        query FindWorkflowVersionSteps($workflowVersionId: UUID!) {
          workflowVersion(filter: { id: { eq: $workflowVersionId } }) {
            steps
          }
        }
      `,
      variables: { workflowVersionId },
    });

    expect(stepsResponse.body.errors).toBeUndefined();

    const step: WorkflowVersionStep =
      stepsResponse.body.data.workflowVersion.steps.find(
        (workflowVersionStep: WorkflowVersionStep) =>
          workflowVersionStep.type === stepType,
      );

    expect(step).toBeDefined();

    const updateStepResponse = await makeGraphqlAPIRequest({
      query: gql`
        mutation UpdateWorkflowVersionStep(
          $input: UpdateWorkflowVersionStepInput!
        ) {
          updateWorkflowVersionStep(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          workflowVersionId,
          step: {
            ...step,
            settings: {
              ...step.settings,
              input: { ...step.settings.input, ...input },
            },
          },
        },
      },
    });

    expect(updateStepResponse.body.errors).toBeUndefined();

    const activateResponse = await makeGraphqlAPIRequest({
      query: gql`
        mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
          activateWorkflowVersion(workflowVersionId: $workflowVersionId)
        }
      `,
      variables: { workflowVersionId },
    });

    expect(activateResponse.body.errors).toBeUndefined();

    const webhookResponse = await request(`http://localhost:${APP_PORT}`).get(
      `/webhooks/workflows/${SEED_APPLE_WORKSPACE_ID}/${workflowId}`,
    );

    expect(webhookResponse.body.success).toBe(true);

    workflowRunId = webhookResponse.body.workflowRunId;

    const workflowRun = await waitForWorkflowCompletion(workflowRunId!);
    const stepInfo = workflowRun?.state?.stepInfos?.[step.id];

    return {
      status: workflowRun?.status,
      stepStatus: stepInfo?.status,
      stepResult: stepInfo?.result,
      stepError: stepInfo?.error,
    };
  } finally {
    if (workflowRunId !== undefined) {
      await destroyWorkflowRun(workflowRunId);
    }

    await makeGraphqlAPIRequest({
      query: gql`
        mutation DestroyWorkflow($id: ID!) {
          destroyWorkflow(id: $id) {
            id
          }
        }
      `,
      variables: { id: workflowId },
    });
  }
};
