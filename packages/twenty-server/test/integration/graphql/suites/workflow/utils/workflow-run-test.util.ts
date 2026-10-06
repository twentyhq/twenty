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
      error?: string;
      history?: Array<{ status: string; error?: string }>;
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
  coreWorkflowId: string | null;
  coreWorkflowVersionId: string | null;
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

export const destroyWorkflowRun = async (
  workflowRunId: string,
): Promise<void> => {
  await client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: `
        mutation DestroyWorkflowRun($id: UUID!) {
          destroyWorkflowRun(id: $id) {
            id
          }
        }
      `,
      variables: { id: workflowRunId },
    });
};

const PENDING_WORKFLOW_RUN_STATUSES: WorkflowRunStatusType[] = [
  'NOT_STARTED',
  'ENQUEUED',
  'RUNNING',
  'STOPPING',
];

export const waitForWorkflowCompletion = async (
  workflowRunId: string,
  maxAttempts = 30,
  intervalMs = 500,
): Promise<WorkflowRunResponse | null> => {
  let workflowRun = await getWorkflowRun(workflowRunId);
  let attempts = 0;

  while (
    workflowRun !== null &&
    PENDING_WORKFLOW_RUN_STATUSES.includes(workflowRun.status) &&
    attempts < maxAttempts
  ) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    workflowRun = await getWorkflowRun(workflowRunId);
    attempts++;
  }

  return workflowRun;
};

export const waitForWorkflowRunStepStatus = async (
  workflowRunId: string,
  stepId: string,
  expectedStatus: string,
  maxAttempts = 30,
  intervalMs = 500,
): Promise<WorkflowRunResponse | null> => {
  let workflowRun = await getWorkflowRun(workflowRunId);
  let attempts = 0;

  while (
    attempts < maxAttempts &&
    workflowRun?.state?.stepInfos?.[stepId]?.status !== expectedStatus &&
    (workflowRun === null ||
      PENDING_WORKFLOW_RUN_STATUSES.includes(workflowRun.status))
  ) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    workflowRun = await getWorkflowRun(workflowRunId);
    attempts++;
  }

  return workflowRun;
};

export const waitForWorkflowRunStatus = async (
  workflowRunId: string,
  expectedStatus: WorkflowRunStatusType,
  maxAttempts = 30,
  intervalMs = 500,
): Promise<WorkflowRunResponse | null> => {
  let workflowRun = await getWorkflowRun(workflowRunId);
  let attempts = 0;

  while (
    attempts < maxAttempts &&
    workflowRun?.status !== expectedStatus &&
    (workflowRun === null ||
      PENDING_WORKFLOW_RUN_STATUSES.includes(workflowRun.status))
  ) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    workflowRun = await getWorkflowRun(workflowRunId);
    attempts++;
  }

  return workflowRun;
};
