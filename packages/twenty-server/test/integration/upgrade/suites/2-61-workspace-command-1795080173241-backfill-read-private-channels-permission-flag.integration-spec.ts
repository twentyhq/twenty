import { SystemPermissionFlag } from 'twenty-shared/constants';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { type BackfillReadPrivateChannelsPermissionFlagCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795080173241-backfill-read-private-channels-permission-flag.command';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const READ_PRIVATE_CHANNELS_FLAG_WHERE = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  universalIdentifier: SystemPermissionFlag.READ_PRIVATE_CHANNELS,
};

describe('2-61 workspace command - backfill read private channels permission flag (integration)', () => {
  let command: BackfillReadPrivateChannelsPermissionFlagCommand;
  let workspaceCacheService: WorkspaceCacheService;

  const permissionFlagRepository = () =>
    getCoreRepository<PermissionFlagEntity>(PermissionFlagEntity);

  // Reproduces a workspace created before the flag existed
  const removeReadPrivateChannelsFlag = async () => {
    await permissionFlagRepository().delete(READ_PRIVATE_CHANNELS_FLAG_WHERE);
    await workspaceCacheService.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['flatPermissionFlagMaps', 'flatRolePermissionFlagMaps'],
    );
  };

  beforeAll(() => {
    command =
      getAppProviderByClassName<BackfillReadPrivateChannelsPermissionFlagCommand>(
        'BackfillReadPrivateChannelsPermissionFlagCommand',
      );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
  });

  afterAll(async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
  });

  it('changes nothing on a dry run', async () => {
    await removeReadPrivateChannelsFlag();

    await command.runOnWorkspace({
      ...RUN_ON_WORKSPACE_ARGS,
      options: { dryRun: true },
    });

    expect(
      await permissionFlagRepository().count({
        where: READ_PRIVATE_CHANNELS_FLAG_WHERE,
      }),
    ).toBe(0);
  });

  it('creates the flag on the standard application and is a no-op on a second run', async () => {
    await removeReadPrivateChannelsFlag();

    const permissionFlagCountBefore = await permissionFlagRepository().count({
      where: { workspaceId: SEED_APPLE_WORKSPACE_ID },
    });

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    const standardApplication = await getCoreRepository<ApplicationEntity>(
      ApplicationEntity,
    ).findOneOrFail({
      where: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
      },
    });

    expect(
      await permissionFlagRepository().find({
        where: READ_PRIVATE_CHANNELS_FLAG_WHERE,
      }),
    ).toEqual([
      expect.objectContaining({
        key: 'READ_PRIVATE_CHANNELS',
        label: 'Read Private Channel Info',
        permissionType: 'settings',
        applicationId: standardApplication.id,
      }),
    ]);
    expect(
      await permissionFlagRepository().count({
        where: { workspaceId: SEED_APPLE_WORKSPACE_ID },
      }),
    ).toBe(permissionFlagCountBefore + 1);
  });
});
