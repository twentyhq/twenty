import request from 'supertest';
import { WORKFLOW_RUN_GQL_FIELDS } from 'test/integration/constants/workflow-gql-fields.constants';
import { v4 as uuidv4 } from 'uuid';

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

      const workflowRun = await getWorkflowRun(workflowRunId);

      expect(workflowRun).toBeDefined();
      expect(workflowRun?.workflowVersionId).toBe(
        QUICK_LEAD_WORKFLOW_VERSION_ID,
      );
      expect(workflowRun?.status).toBe('RUNNING');
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

      expect(workflowRun?.state?.stepInfos?.trigger?.status).toBe('SUCCESS');
      expect(workflowRun?.state?.stepInfos?.[FORM_STEP_ID]?.status).toBe(
        'PENDING',
      );
      expect(
        workflowRun?.state?.stepInfos?.['0715b6cd-7cc1-4b98-971b-00f54dfe643b']
          ?.status,
      ).toBe('NOT_STARTED');
      expect(
        workflowRun?.state?.stepInfos?.['6f553ea7-b00e-4371-9d88-d8298568a246']
          ?.status,
      ).toBe('NOT_STARTED');
    });

    it('should be able to stop a running workflow run', async () => {
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

      expect(stopResponse.body.errors).toBeUndefined();
      expect(stopResponse.body.data.stopWorkflowRun.status).toBe('STOPPED');

      const workflowRun = await getWorkflowRun(workflowRunId);

      expect(workflowRun?.status).toBe('STOPPED');
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

  describe('Full workflow execution with form submission', () => {
    let testWorkflowRunId: string | null = null;
    let createdCompanyId: string | null = null;
    let createdPersonId: string | null = null;

    afterAll(async () => {
      // Clean up created records in reverse order of creation
      if (createdPersonId) {
        await client
          .post('/graphql')
          .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
          .send({
            query: `
              mutation DestroyPerson($id: ID!) {
                destroyPerson(id: $id) {
                  id
                }
              }
            `,
            variables: { id: createdPersonId },
          });
      }

      if (createdCompanyId) {
        await client
          .post('/graphql')
          .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
          .send({
            query: `
              mutation DestroyCompany($id: ID!) {
                destroyCompany(id: $id) {
                  id
                }
              }
            `,
            variables: { id: createdCompanyId },
          });
      }

      if (testWorkflowRunId) {
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
            variables: { id: testWorkflowRunId },
          });
      }
    });

    it('should complete full workflow: trigger → submit form → create Company and Person', async () => {
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

      expect(runWorkflowResponse.body.errors).toBeUndefined();
      testWorkflowRunId =
        runWorkflowResponse.body.data.runWorkflowVersion.workflowRunId;

      expect(testWorkflowRunId).toBeDefined();

      let workflowRun = await getWorkflowRun(testWorkflowRunId as string);

      expect(workflowRun?.status).toBe('RUNNING');
      expect(workflowRun?.state?.stepInfos?.[FORM_STEP_ID]?.status).toBe(
        'PENDING',
      );

      const testId = uuidv4().slice(0, 8);
      const testFormData = {
        firstName: 'Integration',
        lastName: `TestUser-${testId}`,
        email: `test-${testId}@example.com`,
        jobTitle: 'Test Engineer',
        companyName: `Test Company ${testId}`,
        companyDomain: `https://test-${testId}.example.com`,
      };

      const submitFormResponse = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation SubmitFormStep($input: SubmitFormStepInput!) {
              submitFormStep(input: $input)
            }
          `,
          variables: {
            input: {
              stepId: FORM_STEP_ID,
              workflowRunId: testWorkflowRunId,
              response: testFormData,
            },
          },
        });

      expect(submitFormResponse.body.errors).toBeUndefined();
      expect(submitFormResponse.body.data.submitFormStep).toBe(true);

      workflowRun = await getWorkflowRun(testWorkflowRunId as string);
      expect(workflowRun?.status).toBe('COMPLETED');
      expect(workflowRun?.state?.stepInfos?.trigger?.status).toBe('SUCCESS');
      expect(workflowRun?.state?.stepInfos?.[FORM_STEP_ID]?.status).toBe(
        'SUCCESS',
      );
      expect(
        workflowRun?.state?.stepInfos?.['0715b6cd-7cc1-4b98-971b-00f54dfe643b']
          ?.status,
      ).toBe('SUCCESS');
      expect(
        workflowRun?.state?.stepInfos?.['6f553ea7-b00e-4371-9d88-d8298568a246']
          ?.status,
      ).toBe('SUCCESS');

      const companyStepResult = workflowRun?.state?.stepInfos?.[
        '0715b6cd-7cc1-4b98-971b-00f54dfe643b'
      ]?.result as { id?: string } | undefined;

      createdCompanyId = companyStepResult?.id ?? null;
      expect(createdCompanyId).toBeDefined();

      const companyResponse = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            query FindCompany($id: UUID!) {
              company(filter: { id: { eq: $id } }) {
                id
                name
                domainName {
                  primaryLinkUrl
                }
              }
            }
          `,
          variables: { id: createdCompanyId },
        });

      expect(companyResponse.body.errors).toBeUndefined();
      expect(companyResponse.body.data.company).toBeDefined();
      expect(companyResponse.body.data.company.name).toBe(
        testFormData.companyName,
      );
      expect(
        companyResponse.body.data.company.domainName.primaryLinkUrl,
      ).toContain(`test-${testId}.example.com`);

      const personStepResult = workflowRun?.state?.stepInfos?.[
        '6f553ea7-b00e-4371-9d88-d8298568a246'
      ]?.result as { id?: string } | undefined;

      createdPersonId = personStepResult?.id ?? null;
      expect(createdPersonId).toBeDefined();

      const personResponse = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            query FindPerson($id: UUID!) {
              person(filter: { id: { eq: $id } }) {
                id
                name {
                  firstName
                  lastName
                }
                emails {
                  primaryEmail
                }
              }
            }
          `,
          variables: { id: createdPersonId },
        });

      expect(personResponse.body.errors).toBeUndefined();
      expect(personResponse.body.data.person).toBeDefined();
      expect(personResponse.body.data.person.name.firstName).toBe(
        testFormData.firstName,
      );
      expect(personResponse.body.data.person.name.lastName).toBe(
        testFormData.lastName,
      );
      expect(personResponse.body.data.person.emails.primaryEmail).toBe(
        testFormData.email,
      );
    });
  });
});
