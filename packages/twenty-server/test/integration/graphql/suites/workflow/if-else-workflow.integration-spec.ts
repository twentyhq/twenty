import request from 'supertest';
import {
  destroyWorkflowRun,
  runWorkflowVersion,
  waitForWorkflowCompletion,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { ViewFilterOperand } from 'twenty-shared/types';
import { type StepIfElseBranch } from 'twenty-shared/workflow';

const client = request(`http://localhost:${APP_PORT}`);

describe('If/Else Workflow (e2e)', () => {
  let createdWorkflowId: string | null = null;
  let createdWorkflowVersionId: string | null = null;
  let ifElseStepId: string | null = null;
  let ifBranchEmptyNodeId: string | null = null;
  let elseBranchEmptyNodeId: string | null = null;

  beforeAll(async () => {
    const createWorkflowResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflow {
            createWorkflow(data: {
              name: "If/Else Test Workflow"
            }) {
              id
              versions {
                edges {
                  node {
                    id
                    status
                  }
                }
              }
            }
          }
        `,
      });

    expect(createWorkflowResponse.body.errors).toBeUndefined();
    createdWorkflowId = createWorkflowResponse.body.data.createWorkflow.id;
    expect(
      createWorkflowResponse.body.data.createWorkflow.versions.edges.length,
    ).toBeGreaterThan(0);
    createdWorkflowVersionId =
      createWorkflowResponse.body.data.createWorkflow.versions.edges[0].node.id;

    const manualTrigger = {
      name: 'Manual Trigger',
      type: 'MANUAL',
      settings: {
        outputSchema: {
          number: {
            isLeaf: true,
            type: 'number',
            value: undefined,
          },
        },
      },
      nextStepIds: [],
      position: { x: 0, y: 0 },
    };

    const updateWorkflowVersionResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation UpdateWorkflowVersion($id: UUID!, $data: WorkflowVersionUpdateInput!) {
            updateWorkflowVersion(id: $id, data: $data) {
              id
              trigger
            }
          }
        `,
        variables: {
          id: createdWorkflowVersionId,
          data: {
            trigger: manualTrigger,
          },
        },
      });

    expect(updateWorkflowVersionResponse.body.errors).toBeUndefined();

    const createIfElseStepResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflowVersionStep($input: CreateWorkflowVersionStepInput!) {
            createWorkflowVersionStep(input: $input) {
              stepsDiff
            }
          }
        `,
        variables: {
          input: {
            workflowVersionId: createdWorkflowVersionId,
            stepType: 'IF_ELSE',
            parentStepId: 'trigger',
            position: { x: 200, y: 0 },
          },
        },
      });

    expect(createIfElseStepResponse.body.errors).toBeUndefined();

    const getWorkflowVersionResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query GetWorkflowVersion($id: UUID!) {
            workflowVersion(filter: { id: { eq: $id } }) {
              id
              steps
            }
          }
        `,
        variables: { id: createdWorkflowVersionId },
      });

    expect(getWorkflowVersionResponse.body.errors).toBeUndefined();
    const steps = getWorkflowVersionResponse.body.data.workflowVersion.steps;
    const ifElseStep = steps.find(
      (step: { type: string }) => step.type === 'IF_ELSE',
    );

    expect(ifElseStep).toBeDefined();
    ifElseStepId = ifElseStep.id;

    const branches = ifElseStep.settings.input.branches;
    const ifBranch = branches.find(
      (branch: StepIfElseBranch) => branch.filterGroupId,
    );
    const elseBranch = branches.find(
      (branch: StepIfElseBranch) => !branch.filterGroupId,
    );

    expect(ifBranch).toBeDefined();
    expect(elseBranch).toBeDefined();
    expect(ifBranch.nextStepIds.length).toBeGreaterThan(0);
    expect(elseBranch.nextStepIds.length).toBeGreaterThan(0);

    ifBranchEmptyNodeId = ifBranch.nextStepIds[0];
    elseBranchEmptyNodeId = elseBranch.nextStepIds[0];

    expect(ifElseStep.settings.input.stepFilterGroups.length).toBeGreaterThan(
      0,
    );
    expect(ifElseStep.settings.input.stepFilters.length).toBeGreaterThan(0);
    expect(ifElseStep.settings.input.branches.length).toBe(2);

    const ifFilterGroupId = ifBranch.filterGroupId;

    expect(ifFilterGroupId).toBeDefined();

    const filterGroup = ifElseStep.settings.input.stepFilterGroups.find(
      (g: { id: string }) => g.id === ifFilterGroupId,
    );

    expect(filterGroup).toBeDefined();

    const updateIfElseStepResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation UpdateWorkflowVersionStep($input: UpdateWorkflowVersionStepInput!) {
            updateWorkflowVersionStep(input: $input) {
              id
              type
              name
            }
          }
        `,
        variables: {
          input: {
            workflowVersionId: createdWorkflowVersionId,
            step: {
              ...ifElseStep,
              settings: {
                ...ifElseStep.settings,
                input: {
                  ...ifElseStep.settings.input,
                  stepFilters: [
                    {
                      id: ifElseStep.settings.input.stepFilters[0].id,
                      type: 'NUMBER',
                      stepOutputKey: '{{trigger.number}}',
                      operand: ViewFilterOperand.IS,
                      value: '10',
                      stepFilterGroupId: ifFilterGroupId,
                      positionInStepFilterGroup: 0,
                    },
                  ],
                },
              },
            },
          },
        },
      });

    expect(updateIfElseStepResponse.body.errors).toBeUndefined();

    const activateResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
            activateWorkflowVersion(workflowVersionId: $workflowVersionId)
          }
        `,
        variables: { workflowVersionId: createdWorkflowVersionId },
      });

    expect(activateResponse.body.errors).toBeUndefined();
    expect(activateResponse.body.data.activateWorkflowVersion).toBe(true);
  });

  afterAll(async () => {
    if (createdWorkflowId) {
      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation DestroyWorkflow($id: ID!) {
              destroyWorkflow(id: $id) {
                id
              }
            }
          `,
          variables: { id: createdWorkflowId },
        });
    }
  });

  const identifyBranches = (branches: StepIfElseBranch[]) => {
    const ifBranch = branches.find((branch) => branch.filterGroupId);
    const elseBranch = branches.find((branch) => !branch.filterGroupId);

    return { ifBranch, elseBranch };
  };

  describe('Workflow structure', () => {
    it('should verify If/Else workflow exists and is active', async () => {
      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            query FindWorkflow($id: UUID!) {
              workflow(filter: { id: { eq: $id } }) {
                id
                name
                lastPublishedVersionId
                statuses
              }
            }
          `,
          variables: { id: createdWorkflowId },
        });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.workflow.id).toBe(createdWorkflowId);
      expect(response.body.data.workflow.name).toBe('If/Else Test Workflow');
      expect(response.body.data.workflow.lastPublishedVersionId).toBe(
        createdWorkflowVersionId,
      );
      expect(response.body.data.workflow.statuses).toContain('ACTIVE');
    });

    it('should verify If/Else workflow version has correct structure', async () => {
      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            query FindWorkflowVersion($id: UUID!) {
              workflowVersion(filter: { id: { eq: $id } }) {
                id
                name
                status
                trigger
                steps
              }
            }
          `,
          variables: { id: createdWorkflowVersionId },
        });

      expect(response.body.errors).toBeUndefined();

      const workflowVersion = response.body.data.workflowVersion;

      expect(workflowVersion.status).toBe('ACTIVE');

      const trigger = workflowVersion.trigger;

      expect(trigger.type).toBe('MANUAL');
      expect(trigger.nextStepIds).toContain(ifElseStepId);

      const steps = workflowVersion.steps;

      const ifElseStep = steps.find(
        (step: { id: string }) => step.id === ifElseStepId,
      );

      expect(ifElseStep).toBeDefined();
      expect(ifElseStep.type).toBe('IF_ELSE');
      expect(ifElseStep.name).toBe('If/Else');
      expect(ifElseStep.settings.input.branches.length).toBe(2);

      const { ifBranch, elseBranch } = identifyBranches(
        ifElseStep.settings.input.branches,
      );

      expect(ifBranch?.filterGroupId).toBeDefined();
      expect(elseBranch?.filterGroupId).toBeUndefined();
      expect(ifBranch?.nextStepIds).toContain(ifBranchEmptyNodeId);
      expect(elseBranch?.nextStepIds).toContain(elseBranchEmptyNodeId);
    });
  });

  describe('If/Else branching execution', () => {
    const getIfElseStepWithBranches = async (): Promise<{
      id: string;
      settings: {
        input: {
          branches: StepIfElseBranch[];
        };
      };
    }> => {
      const getWorkflowVersionResponse = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            query GetWorkflowVersion($id: UUID!) {
              workflowVersion(filter: { id: { eq: $id } }) {
                id
                steps
              }
            }
          `,
          variables: { id: createdWorkflowVersionId },
        });

      expect(getWorkflowVersionResponse.body.errors).toBeUndefined();
      const steps = getWorkflowVersionResponse.body.data.workflowVersion.steps;
      const ifElseStep = steps.find(
        (step: { id: string }) => step.id === ifElseStepId,
      ) as
        | {
            id: string;
            settings: {
              input: {
                branches: Array<{
                  id: string;
                  filterGroupId?: string;
                  nextStepIds: string[];
                }>;
              };
            };
          }
        | undefined;

      expect(ifElseStep).toBeDefined();

      return ifElseStep!;
    };

    const verifyBranchExecution = async ({
      payload,
      expectedBranchType,
    }: {
      payload: { number: number };
      expectedBranchType: 'if' | 'else';
    }) => {
      const workflowRunId = await runWorkflowVersion({
        workflowVersionId: createdWorkflowVersionId!,
        payload,
      });

      const workflowRun = await waitForWorkflowCompletion(workflowRunId);

      expect(workflowRun?.status).toBe('COMPLETED');
      expect(workflowRun?.state?.stepInfos?.trigger?.status).toBe('SUCCESS');
      expect(workflowRun?.state?.stepInfos?.[ifElseStepId!]?.status).toBe(
        'SUCCESS',
      );

      const ifElseStepResult = workflowRun?.state?.stepInfos?.[ifElseStepId!]
        ?.result as { matchingBranchId?: string } | undefined;

      expect(ifElseStepResult?.matchingBranchId).toBeDefined();

      const ifElseStep = await getIfElseStepWithBranches();

      const matchedBranch = ifElseStep.settings.input.branches.find(
        (branch) => branch.id === ifElseStepResult?.matchingBranchId,
      );

      if (!matchedBranch) {
        const branchIds = ifElseStep.settings.input.branches.map((b) => b.id);

        throw new Error(
          `Branch with ID ${ifElseStepResult?.matchingBranchId} not found. Available branch IDs: ${branchIds.join(', ')}`,
        );
      }

      const { ifBranch, elseBranch } = identifyBranches(
        ifElseStep.settings.input.branches,
      );

      const expectedBranch =
        expectedBranchType === 'if' ? ifBranch : elseBranch;
      const expectedEmptyNodeId =
        expectedBranchType === 'if'
          ? ifBranchEmptyNodeId
          : elseBranchEmptyNodeId;
      const otherEmptyNodeId =
        expectedBranchType === 'if'
          ? elseBranchEmptyNodeId
          : ifBranchEmptyNodeId;

      expect(matchedBranch.id).toBe(expectedBranch?.id);
      expect(matchedBranch.nextStepIds).toContain(expectedEmptyNodeId);
      expect(matchedBranch.nextStepIds).not.toContain(otherEmptyNodeId);

      await destroyWorkflowRun(workflowRunId);
    };

    it('should execute IF branch when condition is true', async () => {
      await verifyBranchExecution({
        payload: { number: 10 },
        expectedBranchType: 'if',
      });
    });

    it('should execute ELSE branch when condition is false', async () => {
      await verifyBranchExecution({
        payload: { number: 5 },
        expectedBranchType: 'else',
      });
    });
  });
});
