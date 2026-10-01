import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type DropWorkflowRunRuleRecordSharesCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790866795187-drop-workflow-run-rule-record-shares.command';
import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const schemaName = getWorkspaceSchemaName(workspaceId);

describe('2-45 workspace command 1790866795187 - DropWorkflowRunRuleRecordSharesCommand (integration)', () => {
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

  const countRuleRecordShares = async () => {
    const [{ count }] = await globalThis.testDataSource.query(
      `SELECT COUNT(*)::int AS count FROM "${schemaName}"."recordShare" WHERE "rowCause" = 'RULE' AND "principalType" = 'EVERYONE'`,
    );

    return count as number;
  };

  const countWorkflowRuns = async () => {
    const [{ count }] = await globalThis.testDataSource.query(
      `SELECT COUNT(*)::int AS count FROM "${schemaName}"."workflowRun"`,
    );

    return count as number;
  };

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
        expect.objectContaining({ command, timestamp: 1790866795187 }),
      ]),
    );
  });

  it('restores a grant to everyone on each run of a shared workflow on the way down', async () => {
    expect(await countWorkflowRuns()).toBeGreaterThan(0);

    await run('down');

    expect(await countRuleRecordShares()).toBe(await countWorkflowRuns());
  });

  it('drops those grants on the way up, and only on a real run', async () => {
    await run('down');
    await run('up', { dryRun: true });

    expect(await countRuleRecordShares()).toBeGreaterThan(0);

    await run('up');

    expect(await countRuleRecordShares()).toBe(0);
  });
});
