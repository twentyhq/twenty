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

const TERMINAL_WORKFLOW_RUN_STATUSES = new Set<WorkflowRunStatusType>([
  'COMPLETED',
  'FAILED',
  'STOPPED',
]);

// The real BullMQ driver runs workflow steps asynchronously, so tests wait for
// the run to reach the state they assert on instead of reading it immediately.
export const waitForWorkflowRun = async (
  workflowRunId: string,
  predicate: (workflowRun: WorkflowRunResponse) => boolean,
  { maxAttempts = 60, intervalMs = 250 } = {},
): Promise<WorkflowRunResponse | null> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const workflowRun = await getWorkflowRun(workflowRunId);

    if (workflowRun && predicate(workflowRun)) {
      return workflowRun;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return getWorkflowRun(workflowRunId);
};

export const waitForWorkflowCompletion = (
  workflowRunId: string,
): Promise<WorkflowRunResponse | null> =>
  waitForWorkflowRun(workflowRunId, (workflowRun) =>
    TERMINAL_WORKFLOW_RUN_STATUSES.has(workflowRun.status),
  );

export type WorkflowResponse = {
  id: string;
  statuses: string[] | null;
};

const getWorkflow = async (
  workflowId: string,
): Promise<WorkflowResponse | null> => {
  const response = await client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: `
        query FindWorkflow($id: UUID!) {
          workflow(filter: { id: { eq: $id } }) {
            id
            statuses
          }
        }
      `,
      variables: { id: workflowId },
    });

  if (response.body.errors || !response.body.data?.workflow) {
    return null;
  }

  return response.body.data.workflow;
};

// activateWorkflowVersion returns before the async job that projects
// workflow.statuses has run, so wait for the status to land before asserting.
export const waitForWorkflowToBeActive = async (
  workflowId: string,
  { maxAttempts = 60, intervalMs = 250 } = {},
): Promise<WorkflowResponse | null> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const workflow = await getWorkflow(workflowId);

    if (workflow?.statuses?.includes('ACTIVE')) {
      return workflow;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return getWorkflow(workflowId);
};
