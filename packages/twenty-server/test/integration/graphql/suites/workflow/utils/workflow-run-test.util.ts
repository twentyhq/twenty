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
