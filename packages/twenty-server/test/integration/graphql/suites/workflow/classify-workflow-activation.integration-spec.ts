import request from 'supertest';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';

const client = request(`http://localhost:${APP_PORT}`);

// The settings schema requires uuids here, so these are fixed rather than
// readable: a non-uuid would be refused for the wrong reason.
const SECOND_QUESTION_ID = '0f7f5f2e-6f1e-4c1e-9a3e-2b7d9a1c4e81';
const BILLING_CRITERION_ID = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
const SUPPORT_CRITERION_ID = '2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e';

const graphql = async (query: string, variables?: Record<string, unknown>) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

const graphqlOrFail = async (
  query: string,
  variables?: Record<string, unknown>,
) => {
  const response = await graphql(query, variables);

  expect(response.body.errors).toBeUndefined();

  return response.body.data;
};

const validateWorkflowVersion = (workflowVersionId: string) =>
  graphql(
    `
      mutation ValidateWorkflowVersion($workflowVersionId: UUID!) {
        validateWorkflowVersion(workflowVersionId: $workflowVersionId)
      }
    `,
    { workflowVersionId },
  );

const updateStep = (
  workflowVersionId: string,
  step: Record<string, unknown>,
) =>
  graphql(
    `
      mutation UpdateWorkflowVersionStep(
        $input: UpdateWorkflowVersionStepInput!
      ) {
        updateWorkflowVersionStep(input: $input) {
          id
        }
      }
    `,
    { input: { workflowVersionId, step } },
  );

type ClassifyQuestion = {
  id: string;
  name: string;
  type: string;
  instructions: string;
  criteria: { id: string; name: string }[];
};

type ClassifyStep = {
  id: string;
  type: string;
  settings: {
    input: { state: string; questions: ClassifyQuestion[] };
  } & Record<string, unknown>;
};

describe('Classify step activation (e2e)', () => {
  let workflowVersionId: string;
  let classifyStep: ClassifyStep;

  beforeAll(async () => {
    const createData = await graphqlOrFail(`
      mutation CreateWorkflow {
        createWorkflow(data: { name: "Classify activation test" }) {
          id
        }
      }
    `);

    const workflowData = await graphqlOrFail(
      `
        query GetWorkflow($id: UUID!) {
          workflow(filter: { id: { eq: $id } }) {
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
      { id: createData.createWorkflow.id },
    );

    workflowVersionId = workflowData.workflow.versions.edges[0].node.id;

    await updateWorkflowVersionTrigger({
      workflowVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    await graphqlOrFail(
      `
        mutation CreateWorkflowVersionStep(
          $input: CreateWorkflowVersionStepInput!
        ) {
          createWorkflowVersionStep(input: $input) {
            stepsDiff
          }
        }
      `,
      {
        input: {
          workflowVersionId,
          stepType: 'CLASSIFY',
          parentStepId: 'trigger',
          position: { x: 200, y: 0 },
        },
      },
    );

    const stepsData = await graphqlOrFail(
      `
        query GetWorkflowVersion($id: UUID!) {
          workflowVersion(filter: { id: { eq: $id } }) {
            steps
          }
        }
      `,
      { id: workflowVersionId },
    );

    classifyStep = stepsData.workflowVersion.steps.find(
      (step: { type: string }) => step.type === 'CLASSIFY',
    );
  });

  const stepWithQuestions = (
    questions: ClassifyQuestion[],
    state = 'The message body',
  ): Record<string, unknown> => ({
    ...classifyStep,
    settings: {
      ...classifyStep.settings,
      input: { state, questions },
    },
  });

  const completeQuestion = (
    overrides: Partial<ClassifyQuestion> = {},
  ): ClassifyQuestion => ({
    id: classifyStep.settings.input.questions[0].id,
    name: 'intent',
    type: 'choice',
    instructions: 'Which team should handle this?',
    criteria: [
      { id: BILLING_CRITERION_ID, name: 'billing' },
      { id: SUPPORT_CRITERION_ID, name: 'support' },
    ],
    ...overrides,
  });

  it('should ship a step that cannot be activated until it is configured', () => {
    expect(classifyStep).toBeDefined();
    expect(classifyStep.settings.input.state).toBe('');
    expect(classifyStep.settings.input.questions).toHaveLength(1);
    expect(classifyStep.settings.input.questions[0].instructions).toBe('');
    expect(classifyStep.settings.input.questions[0].criteria).toEqual([]);
  });

  it('should refuse to validate the step as it ships', async () => {
    const response = await validateWorkflowVersion(workflowVersionId);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.subCode).toBe(
      'NON_ACTIVABLE_WORKFLOW_VERSION',
    );
  });

  // A dot would be read as structure by the variable resolver, so an answer
  // named this way could never be referenced downstream.
  it('should refuse an answer name that is not a valid variable key', async () => {
    const response = await updateStep(
      workflowVersionId,
      stepWithQuestions([completeQuestion({ name: 'customer.intent' })]),
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.subCode).toBe(
      'MALFORMED_WORKFLOW_VERSION',
    );
  });

  it('should refuse two questions that would write the same answer', async () => {
    await graphqlOrFail(
      `
        mutation UpdateWorkflowVersionStep(
          $input: UpdateWorkflowVersionStepInput!
        ) {
          updateWorkflowVersionStep(input: $input) {
            id
          }
        }
      `,
      {
        input: {
          workflowVersionId,
          step: stepWithQuestions([
            completeQuestion(),
            completeQuestion({ id: SECOND_QUESTION_ID }),
          ]),
        },
      },
    );

    const response = await validateWorkflowVersion(workflowVersionId);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.subCode).toBe(
      'NON_ACTIVABLE_WORKFLOW_VERSION',
    );
    expect(response.body.errors[0].message).toMatch(/intent/i);
  });

  it('should validate a fully configured step', async () => {
    await graphqlOrFail(
      `
        mutation UpdateWorkflowVersionStep(
          $input: UpdateWorkflowVersionStepInput!
        ) {
          updateWorkflowVersionStep(input: $input) {
            id
          }
        }
      `,
      {
        input: {
          workflowVersionId,
          step: stepWithQuestions([completeQuestion()]),
        },
      },
    );

    const response = await validateWorkflowVersion(workflowVersionId);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.validateWorkflowVersion).toBe(true);
  });
});
