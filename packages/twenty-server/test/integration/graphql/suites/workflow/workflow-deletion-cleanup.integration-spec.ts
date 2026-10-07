import { randomUUID } from 'node:crypto';

import {
  buildTestApplicationManifest,
  buildTestApplicationWorkflow,
  countCoreWorkflows,
  countTestCompanies,
  countTestWorkflowRuns,
  createCompanyStep,
  findTestWorkflowVersionId,
  formStep,
  logicFunctionStep,
  runCoreWorkflowVersion,
  type TestApplicationWorkflow,
  waitForTestWorkflowRun,
} from 'test/integration/graphql/suites/workflow/utils/application-workflow-test.util';
import { submitFormStep } from 'test/integration/graphql/suites/workflow/utils/submit-form-step.util';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { runWorkflowVersion } from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type DeleteWorkflowActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workflow/services/delete-workflow-action-handler.service';
import { type WorkflowDeletionCleanupWorkspaceService } from 'src/modules/workflow/workflow-deletion/services/workflow-deletion-cleanup.workspace-service';

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

const deleteWorkflowRunsAgain = (coreWorkflowId: string) =>
  getAppProviderByClassName<WorkflowDeletionCleanupWorkspaceService>(
    'WorkflowDeletionCleanupWorkspaceService',
  ).deleteWorkflowRuns({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    coreWorkflowId,
  });

const mockLogicFunctionExecution = () =>
  jest
    .spyOn(
      getAppProviderByClassName<LogicFunctionExecutorService>(
        'LogicFunctionExecutorService',
      ),
      'execute',
    )
    .mockResolvedValue({
      data: { ran: true },
      duration: 1,
      billedDurationMs: 1,
      logs: '',
      status: LogicFunctionExecutionStatus.SUCCESS,
    });

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
    let keptWorkflow: WorkspaceWorkflow;
    let codeLogicFunctionId: string;
    let keptCodeLogicFunctionId: string;
    let completedRunId: string;
    let waitingRunId: string;
    let keptRunId: string;
    let draftRunId: string;
    let formStepId: string;

    const waitForCoreLink = async ({
      workflowId,
      workflowVersionId,
    }: {
      workflowId: string;
      workflowVersionId: string;
    }): Promise<
      Pick<WorkspaceWorkflow, 'coreWorkflowId' | 'coreWorkflowVersionId'>
    > => {
      for (let attempt = 0; attempt < 40; attempt++) {
        const [mirror] = await globalThis.testDataSource.query(
          `SELECT w."coreWorkflowId", v."coreWorkflowVersionId"
           FROM "${SCHEMA}".workflow w
           JOIN "${SCHEMA}"."workflowVersion" v ON v."workflowId" = w.id
           WHERE w.id = $1 AND v.id = $2`,
          [workflowId, workflowVersionId],
        );

        if (mirror?.coreWorkflowId && mirror?.coreWorkflowVersionId) {
          return {
            coreWorkflowId: mirror.coreWorkflowId,
            coreWorkflowVersionId: mirror.coreWorkflowVersionId,
          };
        }

        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      throw new Error(
        `${workflowVersionId} was never linked to its core version`,
      );
    };

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

      return {
        workflowId: createWorkflow.id,
        workflowVersionId,
        ...(await waitForCoreLink({
          workflowId: createWorkflow.id,
          workflowVersionId,
        })),
      };
    };

    const createStep = async ({
      workflowVersionId,
      stepType,
      parentStepId,
    }: {
      workflowVersionId: string;
      stepType: 'CODE' | 'FORM';
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
      keptWorkflow = await createWorkspaceWorkflow(`${PREFIX} kept`);

      const codeStep = await createStep({
        workflowVersionId: deletedWorkflow.workflowVersionId,
        stepType: 'CODE',
        parentStepId: 'trigger',
      });
      const formStepOfVersion = await createStep({
        workflowVersionId: deletedWorkflow.workflowVersionId,
        stepType: 'FORM',
        parentStepId: codeStep.id,
      });

      codeLogicFunctionId = codeStep.settings.input.logicFunctionId as string;
      formStepId = formStepOfVersion.id;

      const keptCodeStep = await createStep({
        workflowVersionId: keptWorkflow.workflowVersionId,
        stepType: 'CODE',
        parentStepId: 'trigger',
      });

      keptCodeLogicFunctionId = keptCodeStep.settings.input
        .logicFunctionId as string;

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
              ...formStepOfVersion,
              settings: {
                ...formStepOfVersion.settings,
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

      const executeSpy = mockLogicFunctionExecution();

      try {
        completedRunId = await runWorkflowVersion({
          workflowVersionId: deletedWorkflow.workflowVersionId,
        });
        await waitForTestWorkflowRun(
          completedRunId,
          ({ state }) => state?.stepInfos?.[formStepId]?.status === 'PENDING',
        );
        await submitFormStep({
          workflowRunId: completedRunId,
          stepId: formStepId,
          response: { note: 'Done' },
        });
        await waitForTestWorkflowRun(
          completedRunId,
          ({ status }) => status === 'COMPLETED',
        );

        waitingRunId = await runWorkflowVersion({
          workflowVersionId: deletedWorkflow.workflowVersionId,
        });
        await waitForTestWorkflowRun(
          waitingRunId,
          ({ state }) => state?.stepInfos?.[formStepId]?.status === 'PENDING',
        );

        keptRunId = await runWorkflowVersion({
          workflowVersionId: keptWorkflow.workflowVersionId,
        });
        await waitForTestWorkflowRun(
          keptRunId,
          ({ status }) => status === 'COMPLETED',
        );
      } finally {
        executeSpy.mockRestore();
      }
    }, 180000);

    afterAll(async () => {
      await globalThis.testDataSource.query(
        `DELETE FROM "${SCHEMA}"."workflowRun" WHERE id = ANY($1)`,
        [[completedRunId, waitingRunId, keptRunId, draftRunId]],
      );

      for (const { workflowId } of [deletedWorkflow, keptWorkflow]) {
        await workflowGraphqlRequest(
          'mutation Destroy($id: ID!) { destroyWorkflow(id: $id) { id } }',
          { id: workflowId },
        );
      }
    });

    it('discarding a draft deletes its core version, its runs and the CODE functions only it uses', async () => {
      const { createDraftFromWorkflowVersion } = await graphql(
        `
          mutation CreateDraft($input: CreateDraftFromWorkflowVersionInput!) {
            createDraftFromWorkflowVersion(input: $input) {
              id
              steps
            }
          }
        `,
        {
          input: {
            workflowId: deletedWorkflow.workflowId,
            workflowVersionIdToCopy: deletedWorkflow.workflowVersionId,
          },
        },
      );
      const draftCodeLogicFunctionId =
        createDraftFromWorkflowVersion.steps.find(
          (step: WorkflowVersionStep) => step.type === 'CODE',
        ).settings.input.logicFunctionId;
      const { coreWorkflowVersionId: draftCoreWorkflowVersionId } =
        await waitForCoreLink({
          workflowId: deletedWorkflow.workflowId,
          workflowVersionId: createDraftFromWorkflowVersion.id,
        });

      expect(draftCodeLogicFunctionId).not.toBe(codeLogicFunctionId);

      const executeSpy = mockLogicFunctionExecution();

      try {
        draftRunId = await runWorkflowVersion({
          workflowVersionId: createDraftFromWorkflowVersion.id,
        });
        await waitForTestWorkflowRun(
          draftRunId,
          ({ state }) => state?.stepInfos?.[formStepId]?.status === 'PENDING',
        );
      } finally {
        executeSpy.mockRestore();
      }

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
      expect(await countTestWorkflowRuns([draftRunId])).toBe(0);
      expect(
        await countRows(`core."logicFunction" WHERE id = $1`, [
          codeLogicFunctionId,
        ]),
      ).toBe(1);
      expect(await countTestWorkflowRuns([completedRunId, waitingRunId])).toBe(
        2,
      );
    }, 120000);

    it('deletes the definition, triggers, CODE functions and runs of the deleted workflow only, before the deletion returns', async () => {
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
        { input: { coreWorkflowIds: [deletedWorkflow.coreWorkflowId] } },
      );

      expect(deleteCoreWorkflows).toEqual([
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

      expect(await countTestWorkflowRuns([completedRunId, waitingRunId])).toBe(
        0,
      );

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
      expect(await countTestWorkflowRuns([keptRunId])).toBe(1);
    }, 120000);

    it('lets nothing resume a deleted run', async () => {
      const formAnswer = await submitFormStep({
        workflowRunId: waitingRunId,
        stepId: formStepId,
        response: { note: 'Too late' },
      });

      expect(formAnswer.body.errors).toBeDefined();

      await (
        await global.workflowTestServices.runJob()
      ).handle({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workflowRunId: waitingRunId,
        lastExecutedStepId: formStepId,
      });

      expect(await countTestWorkflowRuns([waitingRunId])).toBe(0);
    }, 120000);

    it('repeats the cleanup safely', async () => {
      await deleteWorkflowRunsAgain(deletedWorkflow.coreWorkflowId);

      expect(await countTestWorkflowRuns([keptRunId])).toBe(1);
      expect(
        await countRows(`core."workflowVersion" WHERE id = $1`, [
          keptWorkflow.coreWorkflowVersionId,
        ]),
      ).toBe(1);
    }, 120000);

    it('deletes runs through the persisted cleanup when deferred migration actions are enabled', async () => {
      const deferredWorkflow = await createWorkspaceWorkflow(
        `${PREFIX} deferred cleanup`,
      );
      const deferredFormStep = await createStep({
        workflowVersionId: deferredWorkflow.workflowVersionId,
        stepType: 'FORM',
        parentStepId: 'trigger',
      });

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
            workflowVersionId: deferredWorkflow.workflowVersionId,
            step: {
              ...deferredFormStep,
              settings: {
                ...deferredFormStep.settings,
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

      const deferredRunId = await runWorkflowVersion({
        workflowVersionId: deferredWorkflow.workflowVersionId,
      });

      await waitForTestWorkflowRun(
        deferredRunId,
        ({ state }) =>
          state?.stepInfos?.[deferredFormStep.id]?.status === 'PENDING',
      );

      await updateFeatureFlag({
        featureFlag:
          FeatureFlagKey.IS_DEFERRED_WORKSPACE_MIGRATION_ACTIONS_ENABLED,
        value: true,
        expectToFail: false,
      });

      try {
        await graphql(
          `
            mutation Delete($input: DeleteCoreWorkflowsInput!) {
              deleteCoreWorkflows(input: $input) {
                id
              }
            }
          `,
          { input: { coreWorkflowIds: [deferredWorkflow.coreWorkflowId] } },
        );

        await expectEventually(
          async () => {
            expect(await countTestWorkflowRuns([deferredRunId])).toBe(0);
            expect(
              await countRows(
                `core."deferredWorkspaceMigrationAction" WHERE "workspaceId" = $1 AND name = $2`,
                [SEED_APPLE_WORKSPACE_ID, 'delete_workflowRuns'],
              ),
            ).toBe(0);
          },
          { timeoutMs: 30_000 },
        );
      } finally {
        await updateFeatureFlag({
          featureFlag:
            FeatureFlagKey.IS_DEFERRED_WORKSPACE_MIGRATION_ACTIONS_ENABLED,
          value: false,
          expectToFail: false,
        });
        await workflowGraphqlRequest(
          'mutation Destroy($id: ID!) { destroyWorkflow(id: $id) { id } }',
          { id: deferredWorkflow.workflowId },
        );
      }
    }, 120000);
  });

  describe('uninstalling an application', () => {
    const APP_ID = randomUUID();
    const OTHER_APP_ID = randomUUID();
    const FUNCTION_ID = randomUUID();
    const SLOW_COMPANY = `${PREFIX} slow company`;

    const FORM_WORKFLOW = buildTestApplicationWorkflow(`${PREFIX} form`, [
      formStep(),
      createCompanyStep(`${PREFIX} form company`),
    ]);
    const SLOW_WORKFLOW = buildTestApplicationWorkflow(`${PREFIX} slow`, [
      logicFunctionStep(FUNCTION_ID),
      createCompanyStep(SLOW_COMPANY),
    ]);
    const OTHER_APP_WORKFLOW = buildTestApplicationWorkflow(
      `${PREFIX} other app form`,
      [formStep(), createCompanyStep(`${PREFIX} other app company`)],
    );

    const createdWorkflowRunIds: string[] = [];
    const versionIdByWorkflowIdentifier = new Map<string, string>();

    const installApplication = async (
      applicationUniversalIdentifier: string,
      workflows: TestApplicationWorkflow[],
    ) => {
      await setupApplicationForSync({
        applicationUniversalIdentifier,
        name: `${PREFIX} ${applicationUniversalIdentifier}`,
        description: 'Application uninstalled with workflow runs',
        sourcePath: `workflow-deletion-cleanup-${applicationUniversalIdentifier}`,
      });
      jest.useRealTimers();

      const installation = await syncApplication({
        manifest: buildTestApplicationManifest({
          applicationUniversalIdentifier,
          roleUniversalIdentifier: randomUUID(),
          companyPermissionUniversalIdentifier: randomUUID(),
          logicFunctionUniversalIdentifier:
            applicationUniversalIdentifier === APP_ID
              ? FUNCTION_ID
              : randomUUID(),
          workflows,
        }),
      });

      expect(installation.errors).toBeUndefined();

      for (const workflow of workflows) {
        const versionId = await findTestWorkflowVersionId({
          applicationUniversalIdentifier,
          workflow,
        });

        if (!isDefined(versionId)) {
          throw new Error(`${workflow.name} was not installed`);
        }

        versionIdByWorkflowIdentifier.set(
          workflow.universalIdentifier,
          versionId,
        );
      }
    };

    const runWorkflow = async (
      workflow: TestApplicationWorkflow,
    ): Promise<string> => {
      const response = await runCoreWorkflowVersion(
        versionIdByWorkflowIdentifier.get(workflow.universalIdentifier) ?? '',
      );

      expect(response.body.errors).toBeUndefined();

      const workflowRunId =
        response.body.data.runCoreWorkflowVersion.workflowRunId;

      createdWorkflowRunIds.push(workflowRunId);

      return workflowRunId;
    };

    const waitForFirstStepPending = (
      workflowRunId: string,
      workflow: TestApplicationWorkflow,
    ) =>
      waitForTestWorkflowRun(
        workflowRunId,
        ({ state }) =>
          state?.stepInfos?.[workflow.steps[0].universalIdentifier]?.status ===
          'PENDING',
      );

    beforeAll(async () => {
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_APPLICATION_WORKFLOWS_ENABLED,
        value: true,
        expectToFail: false,
      });
      await installApplication(APP_ID, [FORM_WORKFLOW, SLOW_WORKFLOW]);
      await installApplication(OTHER_APP_ID, [OTHER_APP_WORKFLOW]);
    }, 180000);

    afterAll(async () => {
      await globalThis.testDataSource.query(
        `DELETE FROM "${SCHEMA}"."workflowRun" WHERE id = ANY($1)`,
        [createdWorkflowRunIds],
      );
      await globalThis.testDataSource.query(
        `DELETE FROM "${SCHEMA}"."company" WHERE name LIKE $1`,
        [`${PREFIX}%`],
      );
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: APP_ID,
      });
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: OTHER_APP_ID,
      });
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_APPLICATION_WORKFLOWS_ENABLED,
        value: false,
        expectToFail: false,
      });
    });

    it('deletes the runs of its workflows when the uninstall succeeds, before it returns', async () => {
      const formRunId = await runWorkflow(FORM_WORKFLOW);
      const otherAppRunId = await runWorkflow(OTHER_APP_WORKFLOW);

      await waitForFirstStepPending(formRunId, FORM_WORKFLOW);
      await waitForFirstStepPending(otherAppRunId, OTHER_APP_WORKFLOW);

      let releaseFunction: () => void = () => {};
      const executeSpy = jest
        .spyOn(
          getAppProviderByClassName<LogicFunctionExecutorService>(
            'LogicFunctionExecutorService',
          ),
          'execute',
        )
        .mockImplementation(
          () =>
            new Promise((resolve) => {
              releaseFunction = () =>
                resolve({
                  data: { ran: true },
                  duration: 1,
                  billedDurationMs: 1,
                  logs: '',
                  status: LogicFunctionExecutionStatus.SUCCESS,
                });
            }),
        );

      try {
        const slowRunId = await runWorkflow(SLOW_WORKFLOW);

        await waitForTestWorkflowRun(
          slowRunId,
          () => executeSpy.mock.calls.length > 0,
        );

        expect(executeSpy).toHaveBeenCalledTimes(1);
        expect(executeSpy).toHaveBeenCalledWith(
          expect.objectContaining({ workspaceId: SEED_APPLE_WORKSPACE_ID }),
        );

        const deleteWorkflowActionHandler =
          getAppProviderByClassName<DeleteWorkflowActionHandlerService>(
            'DeleteWorkflowActionHandlerService',
          );
        const deleteWorkflow =
          deleteWorkflowActionHandler.executeForMetadata.bind(
            deleteWorkflowActionHandler,
          );
        const deleteSpy = jest
          .spyOn(deleteWorkflowActionHandler, 'executeForMetadata')
          .mockImplementationOnce(async (context) => {
            await deleteWorkflow(context);
            throw new Error(
              'Simulated uninstall failure after a workflow delete',
            );
          });

        try {
          const failedUninstall = await uninstallApplication({
            universalIdentifier: APP_ID,
            expectToFail: true,
          });

          expect(failedUninstall.errors).toBeDefined();
        } finally {
          deleteSpy.mockRestore();
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));

        expect(await countCoreWorkflows(FORM_WORKFLOW)).toBe(1);
        expect(await countTestWorkflowRuns([formRunId, slowRunId])).toBe(2);

        const uninstall = await uninstallApplication({
          universalIdentifier: APP_ID,
        });

        expect(uninstall.errors).toBeUndefined();
        expect(await countCoreWorkflows(FORM_WORKFLOW)).toBe(0);
        expect(await countCoreWorkflows(SLOW_WORKFLOW)).toBe(0);

        expect(await countTestWorkflowRuns([formRunId, slowRunId])).toBe(0);

        releaseFunction();

        await new Promise((resolve) => setTimeout(resolve, 2000));

        expect(await countTestWorkflowRuns([slowRunId])).toBe(0);
        expect(await countTestCompanies(SLOW_COMPANY)).toBe(0);
        expect(await countTestWorkflowRuns([otherAppRunId])).toBe(1);
      } finally {
        releaseFunction();
        executeSpy.mockRestore();
      }
    }, 150000);
  });
});
