import gql from 'graphql-tag';
import {
  activateCoreWorkflowVersion,
  coreWorkflowGraphqlRequest,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  findCoreWorkflowVersion,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

type AiAgentStep = {
  id: string;
  type: string;
  settings: { input: { agentId: string } };
};

const findAgent = async (agentId: string) => {
  const response = await makeMetadataApiRequest({
    query: gql`
      query FindOneAgent($id: UUID!) {
        findOneAgent(input: { id: $id }) {
          id
          prompt
          modelId
        }
      }
    `,
    variables: { id: agentId },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.findOneAgent;
};

describe('Draft creation copies step resources (e2e)', () => {
  let coreWorkflowId: string;
  let activeVersionId: string;
  let agentStep: AiAgentStep;

  beforeAll(async () => {
    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'Draft Step Resources Test',
    });

    coreWorkflowId = createdCoreWorkflow.coreWorkflowId;
    activeVersionId = createdCoreWorkflow.coreWorkflowVersionId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId: activeVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    agentStep = await createCoreWorkflowVersionStep<AiAgentStep>({
      coreWorkflowVersionId: activeVersionId,
      stepType: 'AI_AGENT',
    });

    await activateCoreWorkflowVersion({
      coreWorkflowVersionId: activeVersionId,
    });
  });

  afterAll(async () => {
    await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
  });

  it('gives the draft AI agent step its own copy of the agent', async () => {
    const { createDraftFromCoreWorkflowVersion: draft } =
      await coreWorkflowGraphqlRequest<{
        createDraftFromCoreWorkflowVersion: { id: string };
      }>({
        query: `
          mutation CreateDraftFromCoreWorkflowVersion(
            $input: CreateDraftFromCoreWorkflowVersionInput!
          ) {
            createDraftFromCoreWorkflowVersion(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            coreWorkflowId,
            coreWorkflowVersionIdToCopy: activeVersionId,
          },
        },
      });

    const { steps: draftSteps } = await findCoreWorkflowVersion<AiAgentStep>({
      coreWorkflowVersionId: draft.id,
    });

    const draftAgentStep = draftSteps?.find((step) => step.id === agentStep.id);

    const activeAgentId = agentStep.settings.input.agentId;
    const draftAgentId = draftAgentStep?.settings.input.agentId;

    expect(draftAgentId).toBeDefined();
    expect(draftAgentId).not.toBe(activeAgentId);

    const activeAgent = await findAgent(activeAgentId);
    const draftAgent = await findAgent(draftAgentId!);

    expect(draftAgent.prompt).toBe(activeAgent.prompt);
    expect(draftAgent.modelId).toBe(activeAgent.modelId);
  });
});
