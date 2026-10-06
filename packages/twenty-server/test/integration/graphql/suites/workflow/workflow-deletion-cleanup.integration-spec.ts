import { randomUUID } from 'node:crypto';

import {
  activateCoreWorkflowVersion,
  CORE_WORKFLOW_MANUAL_TRIGGER,
  type CreatedCoreWorkflow,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  createDraftFromCoreWorkflowVersion,
  DELETE_CORE_WORKFLOWS_MUTATION,
  deleteCoreWorkflows,
  findCoreWorkflowVersionById,
  updateCoreWorkflowVersionStep,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { isDefined } from 'twenty-shared/utils';

const PREFIX = `Workflow deletion cleanup ${randomUUID()}`;

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

  describe('deleting a core workflow', () => {
    let deletedWorkflow: CreatedCoreWorkflow;
    let keptWorkflow: CreatedCoreWorkflow;
    let codeLogicFunctionId: string;
    let keptCodeLogicFunctionId: string;

    const createManualTriggerWorkflow = async (
      name: string,
    ): Promise<CreatedCoreWorkflow> => {
      const createdCoreWorkflow = await createCoreWorkflow({ name });

      await updateCoreWorkflowVersionTrigger({
        coreWorkflowVersionId: createdCoreWorkflow.coreWorkflowVersionId,
        trigger: CORE_WORKFLOW_MANUAL_TRIGGER,
      });

      return createdCoreWorkflow;
    };

    beforeAll(async () => {
      deletedWorkflow = await createManualTriggerWorkflow(`${PREFIX} deleted`);
      keptWorkflow = await createManualTriggerWorkflow(`${PREFIX} kept`);

      const codeStep = await createCoreWorkflowVersionStep({
        coreWorkflowVersionId: deletedWorkflow.coreWorkflowVersionId,
        stepType: 'CODE',
      });
      const formStep = await createCoreWorkflowVersionStep({
        coreWorkflowVersionId: deletedWorkflow.coreWorkflowVersionId,
        stepType: 'FORM',
        parentStepId: codeStep.id,
      });

      codeLogicFunctionId = codeStep.settings.input.logicFunctionId as string;

      await updateCoreWorkflowVersionStep({
        coreWorkflowVersionId: deletedWorkflow.coreWorkflowVersionId,
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
      });

      await activateCoreWorkflowVersion(deletedWorkflow.coreWorkflowVersionId);

      const keptCodeStep = await createCoreWorkflowVersionStep({
        coreWorkflowVersionId: keptWorkflow.coreWorkflowVersionId,
        stepType: 'CODE',
      });

      keptCodeLogicFunctionId = keptCodeStep.settings.input
        .logicFunctionId as string;
    }, 180000);

    afterAll(async () => {
      await deleteCoreWorkflows(
        [deletedWorkflow, keptWorkflow]
          .filter(isDefined)
          .map(({ coreWorkflowId }) => coreWorkflowId),
      );
    });

    it('discarding a draft deletes its core version and the CODE functions only it uses', async () => {
      const draftCoreWorkflowVersionId =
        await createDraftFromCoreWorkflowVersion({
          coreWorkflowId: deletedWorkflow.coreWorkflowId,
          coreWorkflowVersionIdToCopy: deletedWorkflow.coreWorkflowVersionId,
        });
      const draftVersion = await findCoreWorkflowVersionById(
        draftCoreWorkflowVersionId,
      );
      const draftCodeStep = draftVersion?.steps?.find(
        (step) => step.type === 'CODE',
      );
      const draftCodeLogicFunctionId =
        draftCodeStep?.settings.input.logicFunctionId;

      expect(draftCodeLogicFunctionId).toEqual(expect.any(String));
      expect(draftCodeLogicFunctionId).not.toBe(codeLogicFunctionId);

      await graphql(
        `
          mutation Discard($input: DiscardCoreWorkflowDraftInput!) {
            discardCoreWorkflowDraft(input: $input) {
              id
            }
          }
        `,
        { input: { coreWorkflowVersionId: draftCoreWorkflowVersionId } },
      );

      expect(
        await countRows(`core."workflowVersion" WHERE id = $1`, [
          draftCoreWorkflowVersionId,
        ]),
      ).toBe(0);
      expect(
        await countRows(`core."logicFunction" WHERE id = $1`, [
          draftCodeLogicFunctionId,
        ]),
      ).toBe(0);
      expect(
        await countRows(`core."logicFunction" WHERE id = $1`, [
          codeLogicFunctionId,
        ]),
      ).toBe(1);
    }, 120000);

    it('deletes the versions, command menu item and CODE functions of the deleted workflow only', async () => {
      expect(
        await countRows(
          `core."commandMenuItem" WHERE "coreWorkflowVersionId" = $1`,
          [deletedWorkflow.coreWorkflowVersionId],
        ),
      ).toBe(1);

      const { deleteCoreWorkflows: deletedCoreWorkflows } = await graphql(
        DELETE_CORE_WORKFLOWS_MUTATION,
        { input: { coreWorkflowIds: [deletedWorkflow.coreWorkflowId] } },
      );

      expect(deletedCoreWorkflows).toEqual([
        { id: deletedWorkflow.coreWorkflowId },
      ]);
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
          `core."commandMenuItem" WHERE "coreWorkflowVersionId" = $1`,
          [deletedWorkflow.coreWorkflowVersionId],
        ),
      ).toBe(0);
      expect(
        await countRows(`core."logicFunction" WHERE id = $1`, [
          codeLogicFunctionId,
        ]),
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
