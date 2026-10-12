import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { type OpenShareRecordToEveryObjectCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790876759146-open-share-record-to-every-object.command';
import { CHAT_OR_RECORD_SHARING_FLAG_EXPRESSION } from 'src/database/commands/upgrade-version-command/2-45/utils/build-chat-share-record-availability-updates.util';
import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const { universalIdentifier: SHARE_RECORD_UNIVERSAL_IDENTIFIER } =
  STANDARD_COMMAND_MENU_ITEMS.shareRecord;
const { universalIdentifier: SHARE_ANY_RECORD_UNIVERSAL_IDENTIFIER } =
  STANDARD_COMMAND_MENU_ITEMS.shareAnyRecord;

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

  const findShareItems = async () => {
    const repository = getCoreRepository<CommandMenuItemEntity>(
      CommandMenuItemEntity,
    );

    return {
      shareRecord: await repository.findOneOrFail({
        where: {
          universalIdentifier: SHARE_RECORD_UNIVERSAL_IDENTIFIER,
          workspaceId,
        },
      }),
      shareAnyRecord: await repository.findOne({
        where: {
          universalIdentifier: SHARE_ANY_RECORD_UNIVERSAL_IDENTIFIER,
          workspaceId,
        },
      }),
    };
  };

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

  it('removes the unpinned item and narrows the chat item on the way down', async () => {
    await run('down');

    const { shareRecord, shareAnyRecord } = await findShareItems();

    expect(shareAnyRecord).toBeNull();
    expect(shareRecord.conditionalAvailabilityExpression).not.toBe(
      CHAT_OR_RECORD_SHARING_FLAG_EXPRESSION,
    );
    expect(shareRecord.isPinned).toBe(true);
  });

  it('changes nothing on a dry run', async () => {
    await run('down');
    await run('up', { dryRun: true });

    expect((await findShareItems()).shareAnyRecord).toBeNull();
  });

  it('adds the unpinned item for every object and keeps the chat item pinned on the way up', async () => {
    await run('down');
    await run('up');

    const { shareRecord, shareAnyRecord } = await findShareItems();

    expect(shareAnyRecord).toMatchObject({
      isPinned: false,
      availabilityObjectMetadataId: null,
    });
    expect(shareRecord).toMatchObject({
      isPinned: true,
      conditionalAvailabilityExpression: CHAT_OR_RECORD_SHARING_FLAG_EXPRESSION,
    });
    expect(shareRecord.availabilityObjectMetadataId).not.toBeNull();
  });
});
