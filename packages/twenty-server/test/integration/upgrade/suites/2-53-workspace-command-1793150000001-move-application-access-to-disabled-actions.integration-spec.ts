import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type MoveApplicationAccessToDisabledActionsCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793150000001-move-application-access-to-disabled-actions.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const APPLICATION_WRITABLE_OBJECT = 'rocket';
const APPLICATION_READABLE_OBJECT = 'pet';

type ObjectAccessRow = {
  writability: string;
  readability: string;
  disabledObjectPermissionActions: string[] | null;
};

describe('2-53 workspace command - move application access to disabled actions (integration)', () => {
  let command: MoveApplicationAccessToDisabledActionsCommand;
  let workspaceCacheService: WorkspaceCacheService;

  const setObjectAccess = async (
    nameSingular: string,
    access: ObjectAccessRow,
  ) => {
    await global.testDataSource.query(
      `UPDATE core."objectMetadata"
       SET "writability" = $3, "readability" = $4, "disabledObjectPermissionActions" = $5
       WHERE "workspaceId" = $1 AND "nameSingular" = $2`,
      [
        SEED_APPLE_WORKSPACE_ID,
        nameSingular,
        access.writability,
        access.readability,
        access.disabledObjectPermissionActions === null
          ? null
          : JSON.stringify(access.disabledObjectPermissionActions),
      ],
    );
    await workspaceCacheService.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['flatObjectMetadataMaps'],
    );
  };

  const findObjectAccess = async (
    nameSingular: string,
  ): Promise<ObjectAccessRow> => {
    const [row] = await global.testDataSource.query(
      `SELECT "writability", "readability", "disabledObjectPermissionActions"
       FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = $2`,
      [SEED_APPLE_WORKSPACE_ID, nameSingular],
    );

    return row;
  };

  const findCachedObjectAccess = async (nameSingular: string) => {
    const { flatObjectMetadataMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatObjectMetadataMaps',
      ]);
    const flatObjectMetadata = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).find((objectMetadata) => objectMetadata?.nameSingular === nameSingular);

    return {
      writability: flatObjectMetadata?.writability,
      readability: flatObjectMetadata?.readability,
      disabledObjectPermissionActions:
        flatObjectMetadata?.disabledObjectPermissionActions,
    };
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<MoveApplicationAccessToDisabledActionsCommand>(
        'MoveApplicationAccessToDisabledActionsCommand',
      );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    await setObjectAccess(APPLICATION_WRITABLE_OBJECT, {
      writability: 'APPLICATION',
      readability: 'OPEN',
      disabledObjectPermissionActions: ['canDestroyObjectRecords'],
    });
    await setObjectAccess(APPLICATION_READABLE_OBJECT, {
      writability: 'OPEN',
      readability: 'APPLICATION',
      disabledObjectPermissionActions: null,
    });
  });

  afterAll(async () => {
    for (const nameSingular of [
      APPLICATION_WRITABLE_OBJECT,
      APPLICATION_READABLE_OBJECT,
    ]) {
      await setObjectAccess(nameSingular, {
        writability: 'OPEN',
        readability: 'OPEN',
        disabledObjectPermissionActions: null,
      });
    }
  });

  it('changes nothing on a dry run', async () => {
    await command.runOnWorkspace({
      ...RUN_ON_WORKSPACE_ARGS,
      options: { dryRun: true },
    });

    expect(await findObjectAccess(APPLICATION_WRITABLE_OBJECT)).toEqual({
      writability: 'APPLICATION',
      readability: 'OPEN',
      disabledObjectPermissionActions: ['canDestroyObjectRecords'],
    });
  });

  it('moves APPLICATION writability and readability to disabled actions and refreshes the cache', async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    const expectedWritableAccess = {
      writability: 'OPEN',
      readability: 'OPEN',
      disabledObjectPermissionActions: [
        'canDestroyObjectRecords',
        'canSoftDeleteObjectRecords',
        'canUpdateObjectRecords',
      ],
    };
    const expectedReadableAccess = {
      writability: 'OPEN',
      readability: 'OPEN',
      disabledObjectPermissionActions: ['canReadObjectRecords'],
    };

    expect(await findObjectAccess(APPLICATION_WRITABLE_OBJECT)).toEqual(
      expectedWritableAccess,
    );
    expect(await findObjectAccess(APPLICATION_READABLE_OBJECT)).toEqual(
      expectedReadableAccess,
    );
    expect(await findCachedObjectAccess(APPLICATION_WRITABLE_OBJECT)).toEqual(
      expectedWritableAccess,
    );
    expect(await findCachedObjectAccess(APPLICATION_READABLE_OBJECT)).toEqual(
      expectedReadableAccess,
    );
  });

  it('changes nothing when it runs again', async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(
      (await findObjectAccess(APPLICATION_WRITABLE_OBJECT))
        .disabledObjectPermissionActions,
    ).toEqual([
      'canDestroyObjectRecords',
      'canSoftDeleteObjectRecords',
      'canUpdateObjectRecords',
    ]);
  });
});
