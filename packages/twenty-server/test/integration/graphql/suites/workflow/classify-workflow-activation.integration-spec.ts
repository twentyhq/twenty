import request from 'supertest';
import {
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  updateCoreWorkflowVersionStep,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';

const client = request(`http://localhost:${APP_PORT}`);

// The settings schema requires uuids, and a non-uuid would be refused for the wrong reason.
const SECOND_QUESTION_ID = '0f7f5f2e-6f1e-4c1e-9a3e-2b7d9a1c4e81';
const BILLING_CRITERION_ID = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
const SUPPORT_CRITERION_ID = '2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e';

const graphql = async (query: string, variables?: Record<string, unknown>) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

const activateVersion = (coreWorkflowVersionId: string) =>
  graphql(
    `
      mutation ActivateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
        activateCoreWorkflowVersion(
          coreWorkflowVersionId: $coreWorkflowVersionId
        )
      }
    `,
    { coreWorkflowVersionId },
  );

const updateStep = (
  coreWorkflowVersionId: string,
  step: Record<string, unknown>,
) =>
  graphql(
    `
      mutation UpdateCoreWorkflowVersionStep(
        $input: UpdateCoreWorkflowVersionStepInput!
      ) {
        updateCoreWorkflowVersionStep(input: $input) {
          id
        }
      }
    `,
    { input: { coreWorkflowVersionId, step } },
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
  let coreWorkflowId: string;
  let coreWorkflowVersionId: string;
  let classifyStep: ClassifyStep;

  beforeAll(async () => {
    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'Classify activation test',
    });

    coreWorkflowId = createdCoreWorkflow.coreWorkflowId;
    coreWorkflowVersionId = createdCoreWorkflow.coreWorkflowVersionId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    classifyStep = await createCoreWorkflowVersionStep<ClassifyStep>({
      coreWorkflowVersionId,
      stepType: 'CLASSIFY',
    });
  });

  afterAll(async () => {
    await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
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
    expect(classifyStep.settings.input.questions[0].criteria).toEqual([
      {
        id: expect.any(String),
        name: 'Lawyer',
        description: 'Advises clients on legal matters',
      },
    ]);
  });

  it('should refuse to activate the step as it ships', async () => {
    const response = await activateVersion(coreWorkflowVersionId);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.subCode).toBe(
      'NON_ACTIVABLE_WORKFLOW_VERSION',
    );
  });

  // The variable resolver reads a dot as structure, so the answer could never be referenced downstream.
  it('should refuse an answer name that is not a valid variable key', async () => {
    const response = await updateStep(
      coreWorkflowVersionId,
      stepWithQuestions([completeQuestion({ name: 'customer.intent' })]),
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    expect(response.body.errors[0].message).toContain(
      'Workflow version is malformed',
    );
  });

  it('should refuse two questions that would write the same answer', async () => {
    await updateCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      step: stepWithQuestions([
        completeQuestion(),
        completeQuestion({ id: SECOND_QUESTION_ID }),
      ]),
    });

    const response = await activateVersion(coreWorkflowVersionId);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.subCode).toBe(
      'NON_ACTIVABLE_WORKFLOW_VERSION',
    );
    expect(response.body.errors[0].message).toMatch(/intent/i);
  });

  it('should activate a fully configured step', async () => {
    await updateCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      step: stepWithQuestions([completeQuestion()]),
    });

    const response = await activateVersion(coreWorkflowVersionId);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.activateCoreWorkflowVersion).toBe(true);
  });
});
