import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type DropWorkflowRunRuleRecordSharesCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790876879146-drop-workflow-run-rule-record-shares.command';
import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const schemaName = getWorkspaceSchemaName(workspaceId);

describe('2-45 workspace command 1790876879146 - DropWorkflowRunRuleRecordSharesCommand (integration)', () => {
  let command: DropWorkflowRunRuleRecordSharesCommand;
  let workspaceOrmManager: WorkspaceOrmManager;

  const run = (
    direction: 'up' | 'down',
    { dryRun = false }: { dryRun?: boolean } = {},
  ) =>
    workspaceOrmManager.executeInWorkspaceContext(
      () =>
        command[direction]({
          workspaceId,
          options: { dryRun },
          index: 0,
          total: 1,
        }),
      buildSystemAuthContext(workspaceId),
    );

  const findWorkflowRunShares = async (): Promise<
    { recordId: string; rowCause: string; principalType: string }[]
  > =>
    globalThis.testDataSource.query(
      `SELECT share."recordId", share."rowCause", share."principalType"
       FROM "${schemaName}"."recordShare" share
       JOIN core."objectMetadata" metadata ON metadata.id = share."objectMetadataId"
       WHERE metadata."universalIdentifier" = $1
       ORDER BY share."recordId", share."rowCause", share."principalId"`,
      [STANDARD_OBJECTS.workflowRun.universalIdentifier],
    );

  const findRuleRecordIds = async () =>
    (await findWorkflowRunShares())
      .filter(
        ({ rowCause, principalType }) =>
          rowCause === 'RULE' && principalType === 'EVERYONE',
      )
      .map(({ recordId }) => recordId);

  const findOtherWorkflowRunShares = async () =>
    (await findWorkflowRunShares()).filter(
      ({ rowCause }) => rowCause !== 'RULE',
    );

  const findRunIdsOfSharedWorkflows = async () =>
    (
      await globalThis.testDataSource.query(
        `SELECT run.id
         FROM "${schemaName}"."workflowRun" run
         LEFT JOIN core."workflow" core_workflow ON core_workflow.id = run."coreWorkflowId"
         WHERE core_workflow.id IS NULL
           OR core_workflow."visibility" = 'WORKSPACE'
           OR core_workflow."createdByUserWorkspaceId" IS NULL
         ORDER BY run.id`,
      )
    ).map(({ id }: { id: string }) => id);

  beforeAll(() => {
    command = getAppProviderByClassName<DropWorkflowRunRuleRecordSharesCommand>(
      'DropWorkflowRunRuleRecordSharesCommand',
    );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
  });

  afterAll(async () => {
    await run('up');
  });

  it('is registered in the 2.45 bundle', () => {
    const registry = getAppProviderByClassName<UpgradeCommandRegistryService>(
      'UpgradeCommandRegistryService',
    );

    expect(registry.getBundleForVersion('2.45.0').workspaceCommands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ command, timestamp: 1790876879146 }),
      ]),
    );
  });

  it('restores a grant to everyone on each run of a workspace-visible workflow on the way down', async () => {
    await run('up');

    const runIds = await findRunIdsOfSharedWorkflows();

    expect(runIds.length).toBeGreaterThan(0);
    expect(await findRuleRecordIds()).toEqual([]);

    await run('down');

    expect(await findRuleRecordIds()).toEqual(runIds);
  });

  it('drops those grants on the way up, and only on a real run', async () => {
    await run('down');

    const ruleRecordIds = await findRuleRecordIds();
    const otherShares = await findOtherWorkflowRunShares();

    expect(ruleRecordIds.length).toBeGreaterThan(0);

    await run('up', { dryRun: true });

    expect(await findRuleRecordIds()).toEqual(ruleRecordIds);

    await run('up');

    expect(await findRuleRecordIds()).toEqual([]);
    expect(await findOtherWorkflowRunShares()).toEqual(otherShares);
  });
});
