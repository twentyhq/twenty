import { isDefined } from 'twenty-shared/utils';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type MoveApplicationAndSystemFieldWritabilityToDisabledActionsCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793205123864-move-application-and-system-field-writability-to-disabled-actions.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const APPLICATION_WRITABLE_FIELD = {
  objectNameSingular: 'company',
  name: 'tagline',
};
const SYSTEM_WRITABLE_FIELD = {
  objectNameSingular: 'agentChatThread',
  name: 'totalInputTokens',
};

type FieldWritabilityRow = {
  writability: string;
  disabledFieldPermissionActions: string[] | null;
};

describe('2-53 workspace command - move application and system field writability to disabled actions (integration)', () => {
  let command: MoveApplicationAndSystemFieldWritabilityToDisabledActionsCommand;
  let workspaceCacheService: WorkspaceCacheService;

  const setFieldWritability = async ({
    field,
    access,
  }: {
    field: { objectNameSingular: string; name: string };
    access: FieldWritabilityRow;
  }) => {
    await global.testDataSource.query(
      `UPDATE core."fieldMetadata" field
       SET "writability" = $4, "disabledFieldPermissionActions" = $5
       FROM core."objectMetadata" object
       WHERE object."id" = field."objectMetadataId"
         AND field."workspaceId" = $1 AND object."nameSingular" = $2 AND field."name" = $3`,
      [
        SEED_APPLE_WORKSPACE_ID,
        field.objectNameSingular,
        field.name,
        access.writability,
        isDefined(access.disabledFieldPermissionActions)
          ? JSON.stringify(access.disabledFieldPermissionActions)
          : null,
      ],
    );
    await workspaceCacheService.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['flatFieldMetadataMaps', 'flatFieldMetadataMapsOrm'],
    );
  };

  const findFieldWritability = async (field: {
    objectNameSingular: string;
    name: string;
  }): Promise<FieldWritabilityRow> => {
    const [row] = await global.testDataSource.query(
      `SELECT field."writability", field."disabledFieldPermissionActions"
       FROM core."fieldMetadata" field
       JOIN core."objectMetadata" object ON object."id" = field."objectMetadataId"
       WHERE field."workspaceId" = $1 AND object."nameSingular" = $2 AND field."name" = $3`,
      [SEED_APPLE_WORKSPACE_ID, field.objectNameSingular, field.name],
    );

    return row;
  };

  const findCachedDisabledFieldPermissionActions = async (field: {
    objectNameSingular: string;
    name: string;
  }) => {
    const { flatObjectMetadataMaps, flatFieldMetadataMapsOrm } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMapsOrm',
      ]);
    const objectMetadataId = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).find(
      (objectMetadata) =>
        objectMetadata?.nameSingular === field.objectNameSingular,
    )?.id;

    return Object.values(flatFieldMetadataMapsOrm.byUniversalIdentifier).find(
      (fieldMetadata) =>
        fieldMetadata?.objectMetadataId === objectMetadataId &&
        fieldMetadata?.name === field.name,
    )?.disabledFieldPermissionActions;
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<MoveApplicationAndSystemFieldWritabilityToDisabledActionsCommand>(
        'MoveApplicationAndSystemFieldWritabilityToDisabledActionsCommand',
      );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    await setFieldWritability({
      field: APPLICATION_WRITABLE_FIELD,
      access: {
        writability: 'APPLICATION',
        disabledFieldPermissionActions: ['canReadFieldValue'],
      },
    });
    await setFieldWritability({
      field: SYSTEM_WRITABLE_FIELD,
      access: { writability: 'SYSTEM', disabledFieldPermissionActions: null },
    });
  });

  afterAll(async () => {
    await setFieldWritability({
      field: APPLICATION_WRITABLE_FIELD,
      access: { writability: 'OPEN', disabledFieldPermissionActions: null },
    });
    await setFieldWritability({
      field: SYSTEM_WRITABLE_FIELD,
      access: {
        writability: 'SYSTEM',
        disabledFieldPermissionActions: ['canUpdateFieldValue'],
      },
    });
  });

  it('moves APPLICATION writability to a disabled update and refreshes the cache', async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findFieldWritability(APPLICATION_WRITABLE_FIELD)).toEqual({
      writability: 'OPEN',
      disabledFieldPermissionActions: [
        'canReadFieldValue',
        'canUpdateFieldValue',
      ],
    });
    expect(
      await findCachedDisabledFieldPermissionActions(
        APPLICATION_WRITABLE_FIELD,
      ),
    ).toEqual(['canReadFieldValue', 'canUpdateFieldValue']);
  });

  it('disables updates SYSTEM writability forbade and keeps the stored value', async () => {
    expect(await findFieldWritability(SYSTEM_WRITABLE_FIELD)).toEqual({
      writability: 'SYSTEM',
      disabledFieldPermissionActions: ['canUpdateFieldValue'],
    });
  });
});
