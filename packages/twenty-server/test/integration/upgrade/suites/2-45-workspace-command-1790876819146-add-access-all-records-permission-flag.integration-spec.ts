import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { type AddAccessAllRecordsPermissionFlagCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790876819146-add-access-all-records-permission-flag.command';
import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const ACCESS_ALL_RECORDS_UNIVERSAL_IDENTIFIER =
  SystemPermissionFlag[PermissionFlagType.ACCESS_ALL_RECORDS];

describe('2-45 workspace command 1790876819146 - AddAccessAllRecordsPermissionFlagCommand (integration)', () => {
  let command: AddAccessAllRecordsPermissionFlagCommand;

  const run = (
    direction: 'up' | 'down',
    { dryRun = false }: { dryRun?: boolean } = {},
  ) =>
    command[direction]({
      workspaceId,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  const findPermissionFlag = () =>
    getCoreRepository<PermissionFlagEntity>(PermissionFlagEntity).findOne({
      where: {
        universalIdentifier: ACCESS_ALL_RECORDS_UNIVERSAL_IDENTIFIER,
        workspaceId,
      },
    });

  beforeAll(() => {
    command =
      getAppProviderByClassName<AddAccessAllRecordsPermissionFlagCommand>(
        'AddAccessAllRecordsPermissionFlagCommand',
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
        expect.objectContaining({ command, timestamp: 1790876819146 }),
      ]),
    );
  });

  it('removes the permission flag on the way down', async () => {
    await run('down');

    expect(await findPermissionFlag()).toBeNull();
  });

  it('adds nothing on a dry run', async () => {
    await run('down');
    await run('up', { dryRun: true });

    expect(await findPermissionFlag()).toBeNull();
  });

  it('adds the permission flag on the way up, once', async () => {
    await run('down');
    await run('up');
    await run('up');

    expect(
      await getCoreRepository<PermissionFlagEntity>(PermissionFlagEntity).count(
        {
          where: {
            universalIdentifier: ACCESS_ALL_RECORDS_UNIVERSAL_IDENTIFIER,
            workspaceId,
          },
        },
      ),
    ).toBe(1);
    expect(await findPermissionFlag()).toMatchObject({
      key: PermissionFlagType.ACCESS_ALL_RECORDS,
      permissionType: 'settings',
    });
  });
});
