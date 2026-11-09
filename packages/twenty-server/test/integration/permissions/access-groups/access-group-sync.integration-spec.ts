import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type AccessGroupReadService } from 'src/engine/permissions/internal/access-group/services/access-group-read.service';
import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
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
  let accessGroupSyncService: AccessGroupSyncService;
  let accessGroupReadService: AccessGroupReadService;

  beforeAll(() => {
    accessGroupSyncService = getAppProviderByClassName<AccessGroupSyncService>(
      'AccessGroupSyncService',
    );
    accessGroupReadService = getAppProviderByClassName<AccessGroupReadService>(
      'AccessGroupReadService',
    );
  });

  afterAll(async () => {
    await global.testDataSource.query(`DELETE FROM ${ACCESS_GROUP_TABLE}`);
  });

  it('should create a group per grant, keep their ids and remove stale ones', async () => {
    await accessGroupSyncService.syncAccessGroups(SEED_APPLE_WORKSPACE_ID);

    const accessGroups = await readAccessGroups();

    expect(accessGroups.length).toBeGreaterThan(0);

    await global.testDataSource.query(
      `INSERT INTO ${ACCESS_GROUP_TABLE} ("roleId", "objectMetadataId", "groupHash") VALUES ($1, $2, 'stale-group')`,
      [await findAdminRoleId(), await findPersonObjectMetadataId()],
    );

    await accessGroupSyncService.syncAccessGroups(SEED_APPLE_WORKSPACE_ID);

    expect(await readAccessGroups()).toEqual(accessGroups);
  });

  it('should replace the group of a rule when its content changes', async () => {
    const objectMetadataId = await findPersonObjectMetadataId();
    const [{ id: fieldMetadataId }] = await global.testDataSource.query(
      `SELECT "id" FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND "name" = 'jobTitle'`,
      [objectMetadataId],
    );
    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Access group rule hash',
        description: 'Access group rule hash',
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: true,
        canDestroyAllObjectRecords: true,
      },
    });
    const roleId = data.createOneRole.id;
    const predicateGroupId = v4();
    const predicateId = v4();
    const upsertRule = (value: string) =>
      upsertRowLevelPermissionPredicates({
        expectToFail: false,
        input: {
          roleId,
          objectMetadataId,
          predicateGroups: [
            {
              id: predicateGroupId,
              objectMetadataId,
              logicalOperator:
                RowLevelPermissionPredicateGroupLogicalOperator.AND,
            },
          ],
          predicates: [
            {
              id: predicateId,
              fieldMetadataId,
              operand: RowLevelPermissionPredicateOperand.CONTAINS,
              value,
              rowLevelPermissionPredicateGroupId: predicateGroupId,
            },
          ],
        },
      });
    const readRuleAccessGroups = (): Promise<
      { compactId: number; groupHash: string }[]
    > =>
      global.testDataSource.query(
        `SELECT "compactId", "groupHash" FROM ${ACCESS_GROUP_TABLE} WHERE "rowLevelPermissionPredicateGroupId" = $1`,
        [predicateGroupId],
      );

    try {
      await upsertRule('Paris');
      await accessGroupSyncService.syncAccessGroups(SEED_APPLE_WORKSPACE_ID);

      const [parisAccessGroup] = await readRuleAccessGroups();

      await upsertRule('London');
      await accessGroupSyncService.syncAccessGroups(SEED_APPLE_WORKSPACE_ID);

      const londonAccessGroups = await readRuleAccessGroups();

      expect(parisAccessGroup).toBeDefined();
      expect(londonAccessGroups).toHaveLength(1);
      expect(londonAccessGroups[0].groupHash).not.toBe(
        parisAccessGroup.groupHash,
      );
      expect(londonAccessGroups[0].compactId).not.toBe(
        parisAccessGroup.compactId,
      );
    } finally {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: roleId },
      });
    }
  });

  it('should resolve the caller to the groups of its role', async () => {
    await accessGroupSyncService.syncAccessGroups(SEED_APPLE_WORKSPACE_ID);

    const principals = buildRolePermissionsPrincipals({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      roleId: await findAdminRoleId(),
    });
    const objectMetadataId = await findPersonObjectMetadataId();
    const compactIds = await accessGroupReadService.findCallerCompactIds({
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
