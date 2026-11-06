import {
  activateCoreWorkflowVersion,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  deleteLegacyWorkspaceWorkflowRecords,
  linkCoreWorkflowToLegacyWorkspaceIds,
  runCoreWorkflowVersion,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { waitForWorkflowCompletion } from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { v4 } from 'uuid';

import { type MoveFindRecordsSortsToRecordSortsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793965625303-move-find-records-sorts-to-record-sorts.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const MANUAL_TRIGGER = {
  name: 'Manual Trigger',
  type: 'MANUAL',
  settings: { outputSchema: {} },
  nextStepIds: [],
  position: { x: 0, y: 0 },
};

type FindRecordsStep = {
  id: string;
  type: string;
  settings: { input: Record<string, unknown> } & Record<string, unknown>;
} & Record<string, unknown>;

type SortedWorkflow = {
  coreWorkflowVersionId: string;
  workspaceWorkflowVersionId: string;
  step: FindRecordsStep;
};

const withOrderBy = ({
  step,
  orderBy,
}: {
  step: FindRecordsStep;
  orderBy: Record<string, unknown>;
}): FindRecordsStep => ({
  ...step,
  settings: {
    ...step.settings,
    input: { objectName: 'company', limit: 1, offset: 0, orderBy },
  },
});

describe('2-57 workspace command - move find records sorts to record sorts (integration)', () => {
  let command: MoveFindRecordsSortsToRecordSortsCommand;
  let companyNameFieldId: string;
  let apiSortedWorkflow: SortedWorkflow;
  const coreWorkflowIds: string[] = [];
  const workspaceWorkflowIds: string[] = [];
  const companyIds: string[] = [];

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  const readSteps = async ({
    schema,
    workflowVersionId,
  }: {
    schema: string;
    workflowVersionId: string;
  }): Promise<FindRecordsStep[]> => {
    const [{ steps }] = await global.testDataSource.query(
      `SELECT steps FROM ${schema}."workflowVersion" WHERE id = $1`,
      [workflowVersionId],
    );

    return steps;
  };

  const readRun = async (
    workflowRunId: string,
  ): Promise<{
    status: string;
    state: {
      flow: { steps: FindRecordsStep[] };
      stepInfos: Record<string, unknown>;
    };
  }> => {
    const [run] = await global.testDataSource.query(
      `SELECT status, state FROM ${SCHEMA}."workflowRun" WHERE id = $1`,
      [workflowRunId],
    );

    return run;
  };

  const createSortedWorkflow = async ({
    name,
    orderBy,
  }: {
    name: string;
    orderBy: Record<string, unknown>;
  }): Promise<SortedWorkflow> => {
    const { coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
      name,
    });

    coreWorkflowIds.push(coreWorkflowId);

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: MANUAL_TRIGGER,
    });

    const createdStep = await createCoreWorkflowVersionStep<FindRecordsStep>({
      coreWorkflowVersionId,
      stepType: 'FIND_RECORDS',
    });

    // the write path refuses a GraphQL order now, so the stored shape is written directly
    await global.testDataSource.query(
      `UPDATE core."workflowVersion" SET steps = $2::jsonb WHERE id = $1`,
      [
        coreWorkflowVersionId,
        JSON.stringify([withOrderBy({ step: createdStep, orderBy })]),
      ],
    );

    const {
      workspaceWorkflowId,
      workspaceWorkflowVersionIds: [workspaceWorkflowVersionId],
    } = await linkCoreWorkflowToLegacyWorkspaceIds({
      coreWorkflowId,
      withWorkspaceRecords: true,
    });

    workspaceWorkflowIds.push(workspaceWorkflowId);

    const [step] = await readSteps({
      schema: 'core',
      workflowVersionId: coreWorkflowVersionId,
    });

    return { coreWorkflowVersionId, workspaceWorkflowVersionId, step };
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<MoveFindRecordsSortsToRecordSortsCommand>(
        'MoveFindRecordsSortsToRecordSortsCommand',
      );

    [{ id: companyNameFieldId }] = await global.testDataSource.query(
      `SELECT field.id FROM core."fieldMetadata" field
       JOIN core."objectMetadata" object ON object.id = field."objectMetadataId"
       WHERE object."workspaceId" = $1 AND object."nameSingular" = 'company' AND field.name = 'name'`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    apiSortedWorkflow = await createSortedWorkflow({
      name: 'Find the last company written through the API',
      orderBy: { gqlOperationOrderBy: [{ name: 'DescNullsLast' }] },
    });
  });

  afterAll(async () => {
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."workflowRun" WHERE "coreWorkflowId" = ANY($1::uuid[])`,
      [coreWorkflowIds],
    );
    await deleteCoreWorkflows({ coreWorkflowIds });

    for (const workspaceWorkflowId of workspaceWorkflowIds) {
      await deleteLegacyWorkspaceWorkflowRecords({ workspaceWorkflowId });
    }

    for (const companyId of companyIds) {
      await makeGraphqlApiRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'company',
          recordId: companyId,
          gqlFields: 'id',
        }),
      );
    }
  });

  it('changes nothing in a dry run', async () => {
    await runCommand({ dryRun: true });

    const { coreWorkflowVersionId, workspaceWorkflowVersionId, step } =
      apiSortedWorkflow;

    expect(
      await readSteps({
        schema: 'core',
        workflowVersionId: coreWorkflowVersionId,
      }),
    ).toEqual([step]);
    expect(
      await readSteps({
        schema: SCHEMA,
        workflowVersionId: workspaceWorkflowVersionId,
      }),
    ).toEqual([step]);
  });

  it('converts a sort written through the API into record sorts, the same in core and the workspace', async () => {
    await runCommand();

    const [coreStep] = await readSteps({
      schema: 'core',
      workflowVersionId: apiSortedWorkflow.coreWorkflowVersionId,
    });

    expect(coreStep.settings.input.orderBy).toEqual({
      recordSorts: [{ fieldMetadataId: companyNameFieldId, direction: 'DESC' }],
    });
    expect(
      await readSteps({
        schema: SCHEMA,
        workflowVersionId: apiSortedWorkflow.workspaceWorkflowVersionId,
      }),
    ).toEqual([coreStep]);
  });

  it('runs the converted sort', async () => {
    // Earlier suites in the shard can leave any company names, so the test brings the one that sorts first
    const lastCompanyId = v4();
    const lastCompanyName = 'zzzzzzzzzzzz 2-57 sort';

    await createOneOperation({
      objectMetadataSingularName: 'company',
      input: { id: lastCompanyId, name: lastCompanyName },
    });
    companyIds.push(lastCompanyId);

    await activateCoreWorkflowVersion({
      coreWorkflowVersionId: apiSortedWorkflow.coreWorkflowVersionId,
    });

    const workflowRun = await waitForWorkflowCompletion(
      await runCoreWorkflowVersion({
        coreWorkflowVersionId: apiSortedWorkflow.coreWorkflowVersionId,
      }),
    );

    expect(workflowRun?.status).toBe('COMPLETED');
    expect(
      workflowRun?.state?.stepInfos?.[apiSortedWorkflow.step.id]?.result,
    ).toMatchObject({ first: { id: lastCompanyId, name: lastCompanyName } });
  });

  it('converts the steps of runs that can still execute and leaves ended runs as they ran', async () => {
    const [pendingRunId, failedRunId, endedRunId] = [
      await runCoreWorkflowVersion({
        coreWorkflowVersionId: apiSortedWorkflow.coreWorkflowVersionId,
      }),
      await runCoreWorkflowVersion({
        coreWorkflowVersionId: apiSortedWorkflow.coreWorkflowVersionId,
      }),
      await runCoreWorkflowVersion({
        coreWorkflowVersionId: apiSortedWorkflow.coreWorkflowVersionId,
      }),
    ];

    await waitForWorkflowCompletion(pendingRunId);
    await waitForWorkflowCompletion(failedRunId);
    await waitForWorkflowCompletion(endedRunId);

    const legacySteps = JSON.stringify([apiSortedWorkflow.step]);

    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."workflowRun" SET status = 'NOT_STARTED', state = jsonb_set(state, '{flow,steps}', $2::jsonb) WHERE id = $1`,
      [pendingRunId, legacySteps],
    );
    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."workflowRun" SET status = 'FAILED', state = jsonb_set(state, '{flow,steps}', $2::jsonb) WHERE id = $1`,
      [failedRunId, legacySteps],
    );
    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."workflowRun" SET state = jsonb_set(state, '{flow,steps}', $2::jsonb) WHERE id = $1`,
      [endedRunId, legacySteps],
    );

    const pendingRunBefore = await readRun(pendingRunId);
    const endedRunBefore = await readRun(endedRunId);

    await runCommand();

    const pendingRunAfter = await readRun(pendingRunId);

    expect(pendingRunAfter.state.flow.steps).toEqual(
      await readSteps({
        schema: 'core',
        workflowVersionId: apiSortedWorkflow.coreWorkflowVersionId,
      }),
    );
    expect(pendingRunAfter.state.stepInfos).toEqual(
      pendingRunBefore.state.stepInfos,
    );
    expect((await readRun(failedRunId)).state.flow.steps).toEqual(
      pendingRunAfter.state.flow.steps,
    );
    expect(await readRun(endedRunId)).toEqual(endedRunBefore);
  });
});
