import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { type OpenShareRecordToEveryObjectCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790876759146-open-share-record-to-every-object.command';
import { ALL_OBJECTS_SHARE_RECORD_EXPRESSION } from 'src/database/commands/upgrade-version-command/2-45/utils/build-share-record-availability-update.util';
import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const { universalIdentifier: SHARE_RECORD_UNIVERSAL_IDENTIFIER } =
  STANDARD_COMMAND_MENU_ITEMS.shareRecord;

describe('2-45 workspace command 1790876759146 - OpenShareRecordToEveryObjectCommand (integration)', () => {
  let command: OpenShareRecordToEveryObjectCommand;
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

  const findShareRecord = () =>
    getCoreRepository<CommandMenuItemEntity>(
      CommandMenuItemEntity,
    ).findOneOrFail({
      where: {
        universalIdentifier: SHARE_RECORD_UNIVERSAL_IDENTIFIER,
        workspaceId,
      },
    });

  beforeAll(() => {
    command = getAppProviderByClassName<OpenShareRecordToEveryObjectCommand>(
      'OpenShareRecordToEveryObjectCommand',
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
        expect.objectContaining({ command, timestamp: 1790876759146 }),
      ]),
    );
  });

  it('scopes the Share command back to conversations on the way down', async () => {
    await run('down');

    const shareRecord = await findShareRecord();

    expect(shareRecord.availabilityObjectMetadataId).not.toBeNull();
    expect(shareRecord.conditionalAvailabilityExpression).not.toBe(
      ALL_OBJECTS_SHARE_RECORD_EXPRESSION,
    );
  });

  it('keeps the conversation-only item on a dry run', async () => {
    await run('down');
    await run('up', { dryRun: true });

    expect(
      (await findShareRecord()).availabilityObjectMetadataId,
    ).not.toBeNull();
  });

  it('offers the Share command on every object on the way up', async () => {
    await run('down');
    await run('up');

    expect(await findShareRecord()).toMatchObject({
      availabilityObjectMetadataId: null,
      conditionalAvailabilityExpression: ALL_OBJECTS_SHARE_RECORD_EXPRESSION,
    });
  });
});
