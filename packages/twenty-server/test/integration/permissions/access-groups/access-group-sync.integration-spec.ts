import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AccessGroupService } from 'src/engine/permissions/internal/access-group/services/access-group.service';
import { buildRolePermissionsPrincipals } from 'src/engine/permissions/internal/principal/utils/build-role-permissions-principals.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const ACCESS_GROUP_TABLE = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"."accessGroup"`;

const findAdminRoleId = async (): Promise<string> => {
  const [{ id }] = await global.testDataSource.query(
    `SELECT "id" FROM core."role" WHERE "workspaceId" = $1 AND "label" = 'Admin'`,
    [SEED_APPLE_WORKSPACE_ID],
  );

  return id;
};

const findPersonObjectMetadataId = async (): Promise<string> => {
  const [{ id }] = await global.testDataSource.query(
    `SELECT "id" FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = 'person'`,
    [SEED_APPLE_WORKSPACE_ID],
  );

  return id;
};

const readAccessGroups = async (): Promise<
  { compactId: number; groupHash: string }[]
> =>
  global.testDataSource.query(
    `SELECT "compactId", "groupHash" FROM ${ACCESS_GROUP_TABLE} ORDER BY "compactId"`,
  );

describe('access group sync (integration)', () => {
  let accessGroupService: AccessGroupService;

  beforeAll(() => {
    accessGroupService =
      getAppProviderByClassName<AccessGroupService>('AccessGroupService');
  });

  afterAll(async () => {
    await global.testDataSource.query(`DELETE FROM ${ACCESS_GROUP_TABLE}`);
  });

  it('should create a group per grant, keep their ids and remove stale ones', async () => {
    await accessGroupService.syncAccessGroups(SEED_APPLE_WORKSPACE_ID);

    const accessGroups = await readAccessGroups();

    expect(accessGroups.length).toBeGreaterThan(0);

    await global.testDataSource.query(
      `INSERT INTO ${ACCESS_GROUP_TABLE} ("roleId", "objectMetadataId", "groupHash") VALUES ($1, $2, 'stale-group')`,
      [await findAdminRoleId(), await findPersonObjectMetadataId()],
    );

    await accessGroupService.syncAccessGroups(SEED_APPLE_WORKSPACE_ID);

    expect(await readAccessGroups()).toEqual(accessGroups);
  });

  it('should resolve the caller to the groups of its role', async () => {
    await accessGroupService.syncAccessGroups(SEED_APPLE_WORKSPACE_ID);

    const principals = buildRolePermissionsPrincipals({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      roleId: await findAdminRoleId(),
    });
    const objectMetadataId = await findPersonObjectMetadataId();
    const compactIds = await accessGroupService.findCallerCompactIds({
      principals,
      objectMetadataId,
      operationType: 'read',
    });
    const storedCompactIds = (await readAccessGroups()).map(
      ({ compactId }) => compactId,
    );

    expect(compactIds).toHaveLength(1);
    expect(storedCompactIds).toContain(compactIds[0]);
  });
});
