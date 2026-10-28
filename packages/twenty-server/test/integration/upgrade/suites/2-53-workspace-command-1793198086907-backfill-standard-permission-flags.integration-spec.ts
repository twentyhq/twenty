import { SystemPermissionFlag } from 'twenty-shared/constants';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { type BackfillStandardPermissionFlagsCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793198086907-backfill-standard-permission-flags.command';
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

const CALENDAR_FLAG_WHERE = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  universalIdentifier: SystemPermissionFlag.CREATE_CALENDAR_EVENT_TOOL,
};

describe('2-53 workspace command - backfill standard permission flags (integration)', () => {
  let command: BackfillStandardPermissionFlagsCommand;
  let workspaceCacheService: WorkspaceCacheService;

  const permissionFlagRepository = () =>
    getCoreRepository<PermissionFlagEntity>(PermissionFlagEntity);

  const invalidatePermissionFlagCache = () =>
    workspaceCacheService.invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatPermissionFlagMaps',
      'flatRolePermissionFlagMaps',
    ]);

  // Reproduces a workspace created before the flag existed
  const removeCalendarFlag = async () => {
    await permissionFlagRepository().delete(CALENDAR_FLAG_WHERE);
    await invalidatePermissionFlagCache();
  };

  beforeAll(() => {
    command = getAppProviderByClassName<BackfillStandardPermissionFlagsCommand>(
      'BackfillStandardPermissionFlagsCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
  });

  afterAll(async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);
  });

  it('changes nothing on a dry run', async () => {
    await removeCalendarFlag();

    await command.runOnWorkspace({
      ...RUN_ON_WORKSPACE_ARGS,
      options: { dryRun: true },
    });

    expect(
      await permissionFlagRepository().count({ where: CALENDAR_FLAG_WHERE }),
    ).toBe(0);
  });

  it('creates the missing standard flag on the standard application and is a no-op on a second run', async () => {
    await removeCalendarFlag();

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

    const calendarFlags = await permissionFlagRepository().find({
      where: CALENDAR_FLAG_WHERE,
    });

    expect(calendarFlags).toEqual([
      expect.objectContaining({
        key: 'CREATE_CALENDAR_EVENT_TOOL',
        label: 'Create Calendar Event',
        permissionType: 'tool',
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
