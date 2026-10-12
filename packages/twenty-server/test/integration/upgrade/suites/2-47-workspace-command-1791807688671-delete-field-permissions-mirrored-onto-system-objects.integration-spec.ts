import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type DeleteFieldPermissionsMirroredOntoSystemObjectsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791807688671-delete-field-permissions-mirrored-onto-system-objects.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

describe('2-47 workspace command - delete field permissions mirrored onto system objects (integration)', () => {
  let command: DeleteFieldPermissionsMirroredOntoSystemObjectsCommand;
  let workspaceCacheService: WorkspaceCacheService;

  const mirroredRowId = randomUUID();
  const customObjectRowId = randomUUID();
  const otherApplicationRowId = randomUUID();

  const findFieldId = async (objectNameSingular: string, fieldName: string) => {
    const [{ objectMetadataId, fieldMetadataId }] =
      await global.testDataSource.query(
        `SELECT field."objectMetadataId", field.id AS "fieldMetadataId"
         FROM core."fieldMetadata" field
         JOIN core."objectMetadata" object ON object.id = field."objectMetadataId"
         WHERE field."workspaceId" = $1 AND object."nameSingular" = $2 AND field.name = $3`,
        [SEED_APPLE_WORKSPACE_ID, objectNameSingular, fieldName],
      );

    return { objectMetadataId, fieldMetadataId };
  };

  const refreshCaches = () =>
    workspaceCacheService.invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatFieldPermissionMaps',
      'rolesPermissions',
    ]);

  const findRemainingRowIds = async () => {
    const rows: { id: string }[] = await global.testDataSource.query(
      `SELECT id FROM core."fieldPermission" WHERE id = ANY($1)`,
      [[mirroredRowId, customObjectRowId, otherApplicationRowId]],
    );

    return rows.map(({ id }) => id).sort();
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<DeleteFieldPermissionsMirroredOntoSystemObjectsCommand>(
        'DeleteFieldPermissionsMirroredOntoSystemObjectsCommand',
      );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    const [{ workspaceCustomApplicationId }] =
      await global.testDataSource.query(
        `SELECT "workspaceCustomApplicationId" FROM core.workspace WHERE id = $1`,
        [SEED_APPLE_WORKSPACE_ID],
      );
    const [{ id: otherApplicationId }] = await global.testDataSource.query(
      `SELECT id FROM core.application WHERE "workspaceId" = $1 AND id <> $2 LIMIT 1`,
      [SEED_APPLE_WORKSPACE_ID, workspaceCustomApplicationId],
    );
    const [{ id: roleId }] = await global.testDataSource.query(
      `SELECT id FROM core.role WHERE "workspaceId" = $1 AND label = 'Member'`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    // What restricting company "Tasks" used to mirror onto the system junction
    const mirrored = await findFieldId('taskTarget', 'targetCompany');
    const customObject = await findFieldId('company', 'taskTargets');
    const otherApplication = await findFieldId('noteTarget', 'targetCompany');

    await global.testDataSource.query(
      `INSERT INTO core."fieldPermission"
         (id, "roleId", "objectMetadataId", "fieldMetadataId", "canUpdateFieldValue", "workspaceId", "universalIdentifier", "applicationId")
       VALUES
         ($1, $4, $5, $6, false, $11, $1, $12),
         ($2, $4, $7, $8, false, $11, $2, $12),
         ($3, $4, $9, $10, false, $11, $3, $13)`,
      [
        mirroredRowId,
        customObjectRowId,
        otherApplicationRowId,
        roleId,
        mirrored.objectMetadataId,
        mirrored.fieldMetadataId,
        customObject.objectMetadataId,
        customObject.fieldMetadataId,
        otherApplication.objectMetadataId,
        otherApplication.fieldMetadataId,
        SEED_APPLE_WORKSPACE_ID,
        workspaceCustomApplicationId,
        otherApplicationId,
      ],
    );

    await refreshCaches();
  });

  afterAll(async () => {
    await global.testDataSource.query(
      `DELETE FROM core."fieldPermission" WHERE id = ANY($1)`,
      [[mirroredRowId, customObjectRowId, otherApplicationRowId]],
    );

    await refreshCaches();
  });

  it('should only delete the workspace custom application rows on system objects', async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findRemainingRowIds()).toEqual(
      [customObjectRowId, otherApplicationRowId].sort(),
    );
  });

  it('should change nothing when run again', async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findRemainingRowIds()).toEqual(
      [customObjectRowId, otherApplicationRowId].sort(),
    );
  });
});
