import request from 'supertest';
import { WORKFLOW_RUN_GQL_FIELDS } from 'test/integration/constants/workflow-gql-fields.constants';

const client = request(`http://localhost:${APP_PORT}`);

export type WorkflowRunStatusType =
  | 'NOT_STARTED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'ENQUEUED'
  | 'STOPPING'
  | 'STOPPED';

export type WorkflowRunState = {
  stepInfos?: Record<
    string,
    {
      status: string;
      result?: Record<string, unknown>;
    }
  >;
  flow?: {
    trigger?: {
      type: string;
      nextStepIds: string[];
    };
    steps?: Array<{
      id: string;
      type: string;
      name: string;
    }>;
  };
};

export type WorkflowRunResponse = {
  id: string;
  status: WorkflowRunStatusType;
  state: WorkflowRunState;
  workflowVersionId: string;
};

export const getWorkflowRun = async (
  workflowRunId: string,
): Promise<WorkflowRunResponse | null> => {
  const response = await client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: `
        query FindWorkflowRun($id: UUID!) {
          workflowRun(filter: { id: { eq: $id } }) {
            ${WORKFLOW_RUN_GQL_FIELDS}
          }
        }
      `,
      variables: { id: workflowRunId },
    });

  if (response.body.errors || !response.body.data?.workflowRun) {
    return null;
  }

  return response.body.data.workflowRun;
};

export const runWorkflowVersion = async ({
  workflowVersionId,
  payload,
}: {
  workflowVersionId: string;
  payload?: object;
}): Promise<string> => {
  const response = await client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: `
        mutation RunWorkflowVersion($input: RunWorkflowVersionInput!) {
          runWorkflowVersion(input: $input) {
            workflowRunId
          }
        }
      `,
      variables: {
        input: {
          workflowVersionId,
          payload,
        },
      },
    });

  if (response.body.errors || !response.body.data?.runWorkflowVersion) {
    throw new Error(
      `Failed to run workflow version: ${JSON.stringify(response.body.errors)}`,
    );
  }

  return response.body.data.runWorkflowVersion.workflowRunId;
};

export const destroyWorkflowRun = async (
  workflowRunId: string,
): Promise<void> => {
  await client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: `
        mutation DestroyWorkflowRun($id: ID!) {
          destroyWorkflowRun(id: $id) {
            id
          }
        }
      `,
      variables: { id: workflowRunId },
    });
};

export const waitForWorkflowCompletion = async (
  workflowRunId: string,
  maxAttempts = 30,
  intervalMs = 500,
): Promise<WorkflowRunResponse | null> => {
  let workflowRun = await getWorkflowRun(workflowRunId);
  let attempts = 0;

  while (
    workflowRun?.status === 'RUNNING' &&
    attempts < maxAttempts &&
    workflowRun !== null
  ) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    workflowRun = await getWorkflowRun(workflowRunId);
    attempts++;
  }

  return workflowRun;
};
