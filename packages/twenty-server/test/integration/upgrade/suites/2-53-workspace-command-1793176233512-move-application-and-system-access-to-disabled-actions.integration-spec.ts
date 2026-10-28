import { isDefined } from 'twenty-shared/utils';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type MoveApplicationAndSystemAccessToDisabledActionsCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793176233512-move-application-and-system-access-to-disabled-actions.command';
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
const SYSTEM_OBJECT = 'shortLink';
const SYSTEM_WRITABLE_OBJECT = 'workflowAutomatedTrigger';

const ALL_ACTIONS = [
  'canDestroyObjectRecords',
  'canReadObjectRecords',
  'canSoftDeleteObjectRecords',
  'canUpdateObjectRecords',
];
const WRITE_ACTIONS = [
  'canDestroyObjectRecords',
  'canSoftDeleteObjectRecords',
  'canUpdateObjectRecords',
];

type ObjectAccessRow = {
  writability: string;
  readability: string;
  disabledObjectPermissionActions: string[] | null;
};

describe('2-53 workspace command - move application and system access to disabled actions (integration)', () => {
  let command: MoveApplicationAndSystemAccessToDisabledActionsCommand;
  let workspaceCacheService: WorkspaceCacheService;

  const setObjectAccess = async ({
    nameSingular,
    access,
  }: {
    nameSingular: string;
    access: ObjectAccessRow;
  }) => {
    await global.testDataSource.query(
      `UPDATE core."objectMetadata"
       SET "writability" = $3, "readability" = $4, "disabledObjectPermissionActions" = $5
       WHERE "workspaceId" = $1 AND "nameSingular" = $2`,
      [
        SEED_APPLE_WORKSPACE_ID,
        nameSingular,
        access.writability,
        access.readability,
        isDefined(access.disabledObjectPermissionActions)
          ? JSON.stringify(access.disabledObjectPermissionActions)
          : null,
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
      getAppProviderByClassName<MoveApplicationAndSystemAccessToDisabledActionsCommand>(
        'MoveApplicationAndSystemAccessToDisabledActionsCommand',
      );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    await setObjectAccess({
      nameSingular: APPLICATION_WRITABLE_OBJECT,
      access: {
        writability: 'APPLICATION',
        readability: 'OPEN',
        disabledObjectPermissionActions: ['canDestroyObjectRecords'],
      },
    });
    await setObjectAccess({
      nameSingular: APPLICATION_READABLE_OBJECT,
      access: {
        writability: 'OPEN',
        readability: 'APPLICATION',
        disabledObjectPermissionActions: null,
      },
    });
    await setObjectAccess({
      nameSingular: SYSTEM_OBJECT,
      access: {
        writability: 'SYSTEM',
        readability: 'SYSTEM',
        disabledObjectPermissionActions: null,
      },
    });
    await setObjectAccess({
      nameSingular: SYSTEM_WRITABLE_OBJECT,
      access: {
        writability: 'SYSTEM',
        readability: 'OPEN',
        disabledObjectPermissionActions: null,
      },
    });
  });

  afterAll(async () => {
    for (const nameSingular of [
      APPLICATION_WRITABLE_OBJECT,
      APPLICATION_READABLE_OBJECT,
    ]) {
      await setObjectAccess({
        nameSingular,
        access: {
          writability: 'OPEN',
          readability: 'OPEN',
          disabledObjectPermissionActions: null,
        },
      });
    }
    await setObjectAccess({
      nameSingular: SYSTEM_OBJECT,
      access: {
        writability: 'SYSTEM',
        readability: 'SYSTEM',
        disabledObjectPermissionActions: ALL_ACTIONS,
      },
    });
    await setObjectAccess({
      nameSingular: SYSTEM_WRITABLE_OBJECT,
      access: {
        writability: 'SYSTEM',
        readability: 'OPEN',
        disabledObjectPermissionActions: WRITE_ACTIONS,
      },
    });
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

  it('disables the actions SYSTEM access forbade and keeps the stored values', async () => {
    expect(await findObjectAccess(SYSTEM_OBJECT)).toEqual({
      writability: 'SYSTEM',
      readability: 'SYSTEM',
      disabledObjectPermissionActions: ALL_ACTIONS,
    });
    expect(await findObjectAccess(SYSTEM_WRITABLE_OBJECT)).toEqual({
      writability: 'SYSTEM',
      readability: 'OPEN',
      disabledObjectPermissionActions: WRITE_ACTIONS,
    });
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
