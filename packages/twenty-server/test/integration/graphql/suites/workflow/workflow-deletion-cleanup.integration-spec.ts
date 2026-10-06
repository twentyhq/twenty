import { randomUUID } from 'node:crypto';

import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const PREFIX = `Workflow deletion cleanup ${randomUUID()}`;

type WorkflowVersionStep = {
  id: string;
  type: string;
  settings: { input: Record<string, unknown> };
};

const graphql = async (query: string, variables?: object) => {
  const response = await workflowGraphqlRequest(query, variables);

  expect(response.body.errors).toBeUndefined();

  return response.body.data;
};

const countRows = async (query: string, parameters: unknown[]) => {
  const [{ count }] = await globalThis.testDataSource.query(
    `SELECT COUNT(*)::int AS count FROM ${query}`,
    parameters,
  );

  return count;
};

describe('workflow deletion cleanup', () => {
  beforeAll(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.useFakeTimers();
  });

  describe('deleting a workspace workflow', () => {
    type WorkspaceWorkflow = {
      workflowId: string;
      workflowVersionId: string;
      coreWorkflowId: string;
      coreWorkflowVersionId: string;
    };

    let deletedWorkflow: WorkspaceWorkflow;
    let agentWorkflow: WorkspaceWorkflow;
    let keptWorkflow: WorkspaceWorkflow;
    let workflowAgentId: string;
    let codeLogicFunctionId: string;
    let keptCodeLogicFunctionId: string;

    const createWorkspaceWorkflow = async (
      name: string,
    ): Promise<WorkspaceWorkflow> => {
      const { createWorkflow } = await graphql(
        'mutation CreateWorkflow($name: String!) { createWorkflow(data: { name: $name }) { id } }',
        { name },
      );
      const { workflowVersions } = await graphql(
        `
          query FindDraftVersion($workflowId: UUID!) {
            workflowVersions(filter: { workflowId: { eq: $workflowId } }) {
              edges {
                node {
                  id
                }
              }
            }
          }
        `,
        { workflowId: createWorkflow.id },
      );
      const workflowVersionId = workflowVersions.edges[0].node.id;

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

      for (let attempt = 0; attempt < 40; attempt++) {
        const [mirror] = await globalThis.testDataSource.query(
          `SELECT w."coreWorkflowId", v."coreWorkflowVersionId"
           FROM "${SCHEMA}".workflow w
           JOIN "${SCHEMA}"."workflowVersion" v ON v."workflowId" = w.id
           WHERE w.id = $1 AND v.id = $2`,
          [createWorkflow.id, workflowVersionId],
        );

        if (mirror?.coreWorkflowId && mirror?.coreWorkflowVersionId) {
          return {
            workflowId: createWorkflow.id,
            workflowVersionId,
            coreWorkflowId: mirror.coreWorkflowId,
            coreWorkflowVersionId: mirror.coreWorkflowVersionId,
          };
        }

        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      throw new Error(`${name} was never linked to its core workflow`);
    };

    const createStep = async ({
      workflowVersionId,
      stepType,
      parentStepId,
    }: {
      workflowVersionId: string;
      stepType: 'CODE' | 'FORM' | 'AI_AGENT';
      parentStepId: string;
    }): Promise<WorkflowVersionStep> => {
      await graphql(
        `
          mutation CreateStep($input: CreateWorkflowVersionStepInput!) {
            createWorkflowVersionStep(input: $input) {
              stepsDiff
            }
          }
        `,
        {
          input: {
            workflowVersionId,
            stepType,
            parentStepId,
            position: { x: 200, y: 0 },
          },
        },
      );

      const { workflowVersion } = await graphql(
        'query FindSteps($id: UUID!) { workflowVersion(filter: { id: { eq: $id } }) { steps } }',
        { id: workflowVersionId },
      );

      return workflowVersion.steps.find(
        (step: WorkflowVersionStep) => step.type === stepType,
      );
    };

    beforeAll(async () => {
      deletedWorkflow = await createWorkspaceWorkflow(`${PREFIX} deleted`);
      agentWorkflow = await createWorkspaceWorkflow(`${PREFIX} agent`);
      keptWorkflow = await createWorkspaceWorkflow(`${PREFIX} kept`);

      const codeStep = await createStep({
        workflowVersionId: deletedWorkflow.workflowVersionId,
        stepType: 'CODE',
        parentStepId: 'trigger',
      });
      const formStep = await createStep({
        workflowVersionId: deletedWorkflow.workflowVersionId,
        stepType: 'FORM',
        parentStepId: codeStep.id,
      });

      codeLogicFunctionId = codeStep.settings.input.logicFunctionId as string;

      await graphql(
        `
          mutation UpdateStep($input: UpdateWorkflowVersionStepInput!) {
            updateWorkflowVersionStep(input: $input) {
              id
            }
          }
        `,
        {
          input: {
            workflowVersionId: deletedWorkflow.workflowVersionId,
            step: {
              ...formStep,
              settings: {
                ...formStep.settings,
                input: [
                  {
                    id: randomUUID(),
                    name: 'note',
                    label: 'Note',
                    type: 'TEXT',
                  },
                ],
              },
            },
          },
        },
      );

      await graphql(
        'mutation Activate($workflowVersionId: UUID!) { activateWorkflowVersion(workflowVersionId: $workflowVersionId) }',
        { workflowVersionId: deletedWorkflow.workflowVersionId },
      );

      const agentStep = await createStep({
        workflowVersionId: agentWorkflow.workflowVersionId,
        stepType: 'AI_AGENT',
        parentStepId: 'trigger',
      });

      workflowAgentId = agentStep.settings.input.agentId as string;

      const keptCodeStep = await createStep({
        workflowVersionId: keptWorkflow.workflowVersionId,
        stepType: 'CODE',
        parentStepId: 'trigger',
      });

      keptCodeLogicFunctionId = keptCodeStep.settings.input
        .logicFunctionId as string;
    }, 180000);

    afterAll(async () => {
      for (const { workflowId } of [
        deletedWorkflow,
        agentWorkflow,
        keptWorkflow,
      ]) {
        await workflowGraphqlRequest(
          'mutation Destroy($id: ID!) { destroyWorkflow(id: $id) { id } }',
          { id: workflowId },
        );
      }
    });

    it('deletes the versions, command menu item, CODE functions and agents of the deleted workflows only', async () => {
      expect(
        await countRows(
          `core."commandMenuItem" WHERE "coreWorkflowVersionId" = $1 OR "workflowVersionId" = $2`,
          [
            deletedWorkflow.coreWorkflowVersionId,
            deletedWorkflow.workflowVersionId,
          ],
        ),
      ).toBe(1);

      const { deleteCoreWorkflows } = await graphql(
        `
          mutation Delete($input: DeleteCoreWorkflowsInput!) {
            deleteCoreWorkflows(input: $input) {
              id
            }
          }
        `,
        {
          input: {
            coreWorkflowIds: [
              deletedWorkflow.coreWorkflowId,
              agentWorkflow.coreWorkflowId,
            ],
          },
        },
      );

      expect(deleteCoreWorkflows).toHaveLength(2);
      expect(
        await countRows(`core.workflow WHERE id = $1`, [
          deletedWorkflow.coreWorkflowId,
        ]),
      ).toBe(0);
      expect(
        await countRows(`core."workflowVersion" WHERE "coreWorkflowId" = $1`, [
          deletedWorkflow.coreWorkflowId,
        ]),
      ).toBe(0);
      expect(
        await countRows(
          `core."commandMenuItem" WHERE "coreWorkflowVersionId" = $1 OR "workflowVersionId" = $2`,
          [
            deletedWorkflow.coreWorkflowVersionId,
            deletedWorkflow.workflowVersionId,
          ],
        ),
      ).toBe(0);
      expect(
        await countRows(`core."logicFunction" WHERE id = $1`, [
          codeLogicFunctionId,
        ]),
      ).toBe(0);
      expect(
        await countRows(`core.agent WHERE id = $1`, [workflowAgentId]),
      ).toBe(0);

      expect(
        await countRows(`core.workflow WHERE id = $1`, [
          keptWorkflow.coreWorkflowId,
        ]),
      ).toBe(1);
      expect(
        await countRows(`core."workflowVersion" WHERE id = $1`, [
          keptWorkflow.coreWorkflowVersionId,
        ]),
      ).toBe(1);
      expect(
        await countRows(`core."logicFunction" WHERE id = $1`, [
          keptCodeLogicFunctionId,
        ]),
      ).toBe(1);
    }, 120000);
  });
});
