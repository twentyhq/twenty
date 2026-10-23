import { randomUUID } from 'node:crypto';

import { findWorkspaceApplicationDefaultRoles } from 'test/integration/metadata/suites/application-default-role/utils/find-workspace-application-default-roles.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getRoleIdsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-role-ids-from-role-permission-config.util';
import { type WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';
import { type CoreWorkflowRunnerService } from 'src/modules/workflow/workflow-runner/services/core-workflow-runner.service';
import { buildWorkflowRunSource } from 'src/modules/workflow/workflow-trigger/utils/build-workflow-run-source.util';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const schema = getWorkspaceSchemaName(workspaceId);
const WORKFLOW_NAME = 'Automated run with the standard application role';

describe('An automated workflow run acts with the standard application default role', () => {
  const coreWorkflowId = randomUUID();
  const coreWorkflowVersionId = randomUUID();
  const findCompaniesStepId = randomUUID();

  beforeAll(async () => {
    jest.useRealTimers();

    const [workspace] = await globalThis.testDataSource.query(
      `SELECT "workspaceCustomApplicationId" FROM core.workspace WHERE id = $1`,
      [workspaceId],
    );

    const trigger = {
      name: 'Company is created',
      type: 'DATABASE_EVENT',
      settings: { eventName: 'company.created', outputSchema: {} },
      nextStepIds: [findCompaniesStepId],
    };
    const steps = [
      {
        id: findCompaniesStepId,
        name: 'Find companies',
        type: WorkflowActionType.FIND_RECORDS,
        valid: true,
        settings: {
          input: { objectName: 'company', limit: 1 },
          outputSchema: {},
          errorHandlingOptions: {
            retryOnFailure: { value: false },
            continueOnFailure: { value: false },
          },
        },
        nextStepIds: [],
      },
    ];

    await globalThis.testDataSource.query(
      `INSERT INTO core.workflow (id, "workspaceId", "applicationId", "universalIdentifier", name)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        coreWorkflowId,
        workspaceId,
        workspace.workspaceCustomApplicationId,
        randomUUID(),
        WORKFLOW_NAME,
      ],
    );
    await globalThis.testDataSource.query(
      `INSERT INTO core."workflowVersion" (id, "workspaceId", "applicationId", "universalIdentifier", "coreWorkflowId", "workflowId", status, triggers, steps)
       VALUES ($1, $2, $3, $4, $5, NULL, 'ACTIVE', $6, $7)`,
      [
        coreWorkflowVersionId,
        workspaceId,
        workspace.workspaceCustomApplicationId,
        randomUUID(),
        coreWorkflowId,
        JSON.stringify([trigger]),
        JSON.stringify(steps),
      ],
    );
    await globalThis.testDataSource.query(
      `UPDATE core.workflow SET "lastPublishedCoreWorkflowVersionId" = $2 WHERE id = $1`,
      [coreWorkflowId, coreWorkflowVersionId],
    );
    await global.workflowTestServices.workspaceCache.invalidateAndRecompute(
      workspaceId,
      ['flatWorkflowMaps', 'flatWorkflowVersionMaps'],
    );
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await globalThis.testDataSource.query(
      `DELETE FROM "${schema}"."workflowRun" WHERE "coreWorkflowId" = $1`,
      [coreWorkflowId],
    );
    await globalThis.testDataSource.query(
      'DELETE FROM core."workflowVersion" WHERE "coreWorkflowId" = $1',
      [coreWorkflowId],
    );
    await globalThis.testDataSource.query(
      'DELETE FROM core.workflow WHERE id = $1',
      [coreWorkflowId],
    );
    await global.workflowTestServices.workspaceCache.invalidateAndRecompute(
      workspaceId,
      ['flatWorkflowMaps', 'flatWorkflowVersionMaps'],
    );
  });

  it('reads records as before, with Admin as the standard application role', async () => {
    const { standardApplicationRole } =
      await findWorkspaceApplicationDefaultRoles(workspaceId);

    jestExpectToBeDefined(standardApplicationRole);
    expect(standardApplicationRole.roleUniversalIdentifier).toBe(
      STANDARD_ROLE.admin.universalIdentifier,
    );

    const workflowExecutionContextService =
      getAppProviderByClassName<WorkflowExecutionContextService>(
        'WorkflowExecutionContextService',
      );
    const executionContexts: WorkflowExecutionContext[] = [];
    const getExecutionContext =
      workflowExecutionContextService.getExecutionContext.bind(
        workflowExecutionContextService,
      );

    jest
      .spyOn(workflowExecutionContextService, 'getExecutionContext')
      .mockImplementation(async (runInfo) => {
        const executionContext = await getExecutionContext(runInfo);

        executionContexts.push(executionContext);

        return executionContext;
      });

    const { workflowRunId } =
      await getAppProviderByClassName<CoreWorkflowRunnerService>(
        'CoreWorkflowRunnerService',
      ).run({
        workspaceId,
        coreWorkflowVersionId,
        payload: {},
        source: buildWorkflowRunSource(WORKFLOW_NAME),
      });

    let workflowRun: {
      status: string;
      state: {
        stepInfos: Record<
          string,
          { status: string; result?: { totalCount?: number | string } }
        >;
      };
    };

    await expectEventually(async () => {
      [workflowRun] = await globalThis.testDataSource.query(
        `SELECT status, state FROM "${schema}"."workflowRun" WHERE id = $1`,
        [workflowRunId],
      );

      expect(workflowRun?.status).toBe('COMPLETED');
    });

    expect(
      Number(
        workflowRun!.state.stepInfos[findCompaniesStepId].result?.totalCount,
      ),
    ).toBeGreaterThan(0);

    expect(executionContexts.length).toBeGreaterThan(0);
    for (const executionContext of executionContexts) {
      expect(executionContext.isActingOnBehalfOfUser).toBe(false);
      expect(
        getRoleIdsFromRolePermissionConfig(
          executionContext.rolePermissionConfig,
        ),
      ).toEqual([standardApplicationRole.roleId]);
    }
  });
});
