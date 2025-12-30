import request from 'supertest';

import { WORKFLOW_RUN_GQL_FIELDS } from 'test/integration/constants/workflow-gql-fields.constants';

// Integration tests for the Quick Lead workflow
// Note: These tests verify workflow structure and triggering via GraphQL API.
// Full end-to-end execution (including FORM submission and record creation)
// is not tested here because BullMQ job workers don't run in the test environment.
// The workflow stays in ENQUEUED status after triggering.

const client = request(`http://localhost:${APP_PORT}`);

// Quick Lead workflow IDs from prefill-workflows.ts
const QUICK_LEAD_WORKFLOW_ID = '8b213cac-a68b-4ffe-817a-3ec994e9932d';
const QUICK_LEAD_WORKFLOW_VERSION_ID = 'ac67974f-c524-4288-9d88-af8515400b68';
const FORM_STEP_ID = '6e089bc9-aabd-435f-865f-f31c01c8f4a7';

type WorkflowRunStatusType =
  | 'NOT_STARTED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'ENQUEUED'
  | 'STOPPING'
  | 'STOPPED';

type WorkflowRunState = {
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

type WorkflowRunResponse = {
  id: string;
  status: WorkflowRunStatusType;
  state: WorkflowRunState;
  workflowVersionId: string;
};

const getWorkflowRun = async (
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

describe('Quick Lead Workflow (e2e)', () => {
  let createdWorkflowRunId: string | null = null;

  afterAll(async () => {
    // Clean up workflow run
    if (createdWorkflowRunId) {
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
          variables: { id: createdWorkflowRunId },
        });
    }
  });

  describe('Workflow triggering', () => {
    it('should verify Quick Lead workflow exists and is active', async () => {
      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            query FindWorkflow {
              workflow(filter: { id: { eq: "${QUICK_LEAD_WORKFLOW_ID}" } }) {
                id
                name
                lastPublishedVersionId
                statuses
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.workflow).toBeDefined();
      expect(response.body.data.workflow.id).toBe(QUICK_LEAD_WORKFLOW_ID);
      expect(response.body.data.workflow.name).toBe('Quick Lead');
      expect(response.body.data.workflow.lastPublishedVersionId).toBe(
        QUICK_LEAD_WORKFLOW_VERSION_ID,
      );
      expect(response.body.data.workflow.statuses).toContain('ACTIVE');
    });

    it('should verify Quick Lead workflow version has correct structure', async () => {
      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            query FindWorkflowVersion {
              workflowVersion(filter: { id: { eq: "${QUICK_LEAD_WORKFLOW_VERSION_ID}" } }) {
                id
                name
                status
                trigger
                steps
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const workflowVersion = response.body.data.workflowVersion;

      expect(workflowVersion).toBeDefined();
      expect(workflowVersion.status).toBe('ACTIVE');

      // Verify trigger structure
      const trigger = workflowVersion.trigger;

      expect(trigger.type).toBe('MANUAL');
      expect(trigger.nextStepIds).toContain(FORM_STEP_ID);

      // Verify steps structure
      const steps = workflowVersion.steps;

      expect(steps).toHaveLength(3);

      // Form step
      const formStep = steps.find(
        (step: { id: string }) => step.id === FORM_STEP_ID,
      );

      expect(formStep).toBeDefined();
      expect(formStep.type).toBe('FORM');
      expect(formStep.name).toBe('Quick Lead Form');

      // Create Company step
      const createCompanyStep = steps.find(
        (step: { id: string }) =>
          step.id === '0715b6cd-7cc1-4b98-971b-00f54dfe643b',
      );

      expect(createCompanyStep).toBeDefined();
      expect(createCompanyStep.type).toBe('CREATE_RECORD');
      expect(createCompanyStep.name).toBe('Create Company');

      // Create Person step
      const createPersonStep = steps.find(
        (step: { id: string }) =>
          step.id === '6f553ea7-b00e-4371-9d88-d8298568a246',
      );

      expect(createPersonStep).toBeDefined();
      expect(createPersonStep.type).toBe('CREATE_RECORD');
      expect(createPersonStep.name).toBe('Create Person');
    });

    it('should trigger Quick Lead workflow and create workflow run', async () => {
      const runWorkflowResponse = await client
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
              workflowVersionId: QUICK_LEAD_WORKFLOW_VERSION_ID,
            },
          },
        });

      expect(runWorkflowResponse.status).toBe(200);
      expect(runWorkflowResponse.body.errors).toBeUndefined();
      expect(
        runWorkflowResponse.body.data.runWorkflowVersion.workflowRunId,
      ).toBeDefined();

      const workflowRunId =
        runWorkflowResponse.body.data.runWorkflowVersion.workflowRunId;

      createdWorkflowRunId = workflowRunId;

      // Verify workflow run was created
      const workflowRun = await getWorkflowRun(workflowRunId);

      expect(workflowRun).toBeDefined();
      expect(workflowRun?.workflowVersionId).toBe(QUICK_LEAD_WORKFLOW_VERSION_ID);
      // Status should be ENQUEUED after triggering (jobs are queued but not processed in tests)
      expect(workflowRun?.status).toBe('ENQUEUED');

      // Verify initial state has correct step structure
      expect(workflowRun?.state).toBeDefined();
      expect(workflowRun?.state?.stepInfos).toBeDefined();
      expect(workflowRun?.state?.stepInfos?.trigger).toBeDefined();
      expect(workflowRun?.state?.stepInfos?.[FORM_STEP_ID]).toBeDefined();
      expect(
        workflowRun?.state?.stepInfos?.['0715b6cd-7cc1-4b98-971b-00f54dfe643b'],
      ).toBeDefined();
      expect(
        workflowRun?.state?.stepInfos?.['6f553ea7-b00e-4371-9d88-d8298568a246'],
      ).toBeDefined();

      // All steps should be NOT_STARTED initially
      expect(workflowRun?.state?.stepInfos?.trigger?.status).toBe('NOT_STARTED');
      expect(workflowRun?.state?.stepInfos?.[FORM_STEP_ID]?.status).toBe(
        'NOT_STARTED',
      );
    });

    it('should be able to stop a workflow run', async () => {
      // First trigger a workflow
      const runWorkflowResponse = await client
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
              workflowVersionId: QUICK_LEAD_WORKFLOW_VERSION_ID,
            },
          },
        });

      const workflowRunId =
        runWorkflowResponse.body.data.runWorkflowVersion.workflowRunId;

      // Note: Stopping an ENQUEUED workflow will fail because it's not RUNNING
      // This test documents the expected behavior
      const stopResponse = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation StopWorkflowRun($workflowRunId: UUID!) {
              stopWorkflowRun(workflowRunId: $workflowRunId) {
                id
                status
              }
            }
          `,
          variables: { workflowRunId },
        });

      // Stopping an ENQUEUED workflow should fail
      expect(stopResponse.body.errors).toBeDefined();
      expect(stopResponse.body.errors[0].message).toContain(
        'Workflow run is not running',
      );

      // Clean up - delete the workflow run
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
    });
  });
});
