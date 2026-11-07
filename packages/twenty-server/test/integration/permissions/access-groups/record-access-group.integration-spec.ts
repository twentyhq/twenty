import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type RecordAccessGroupService } from 'src/engine/permissions/internal/access-group/services/record-access-group.service';
import { type AccessGroupService } from 'src/engine/permissions/internal/access-group/services/access-group.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const SCHEMA = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"`;
const ACCESS_GROUP_TABLE = `${SCHEMA}."accessGroup"`;
const PERSON_TABLE = `${SCHEMA}."person"`;

type PersonRow = { id: string; jobTitle: string; accessGroupIds: number[] };

describe('access group ids on records (integration)', () => {
  let accessGroupService: AccessGroupService;
  let recordAccessGroupService: RecordAccessGroupService;
  let objectMetadataId: string;
  let jobTitleFieldMetadataId: string;
  let originalPeople: Pick<PersonRow, 'id' | 'jobTitle'>[];

  const readPeople = (): Promise<PersonRow[]> =>
    global.testDataSource.query(
      `SELECT "id", "jobTitle", "_accessGroupIds" AS "accessGroupIds" FROM ${PERSON_TABLE} WHERE "id" = ANY($1) ORDER BY "id"`,
      [originalPeople.map(({ id }) => id)],
    );

  const readCompactIds = async ({
    roleLabel,
    predicateGroupId,
  }: {
    roleLabel: string;
    predicateGroupId: string | null;
  }): Promise<number[]> => {
    const rows: { compactId: number }[] = await global.testDataSource.query(
      `SELECT "accessGroup"."compactId" FROM ${ACCESS_GROUP_TABLE} "accessGroup"
        JOIN core."role" "role" ON "role"."id" = "accessGroup"."roleId"
        WHERE "role"."label" = $1 AND "accessGroup"."objectMetadataId" = $2
          AND "accessGroup"."rowLevelPermissionPredicateGroupId" IS NOT DISTINCT FROM $3`,
      [roleLabel, objectMetadataId, predicateGroupId],
    );

    return rows.map(({ compactId }) => compactId);
  };

  const syncAndRecompute = async (heldCompactIds: number[] | null = null) => {
    await accessGroupService.syncAccessGroups(SEED_APPLE_WORKSPACE_ID);
    await recordAccessGroupService.recomputeRecordAccessGroupIds({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadataId,
      heldCompactIds,
    });
  };

  beforeAll(async () => {
    accessGroupService =
      getAppProviderByClassName<AccessGroupService>('AccessGroupService');
    recordAccessGroupService =
      getAppProviderByClassName<RecordAccessGroupService>(
        'RecordAccessGroupService',
      );

    [{ id: objectMetadataId }] = await global.testDataSource.query(
      `SELECT "id" FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = 'person'`,
      [SEED_APPLE_WORKSPACE_ID],
    );
    [{ id: jobTitleFieldMetadataId }] = await global.testDataSource.query(
      `SELECT "id" FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND "name" = 'jobTitle'`,
      [objectMetadataId],
    );
    originalPeople = await global.testDataSource.query(
      `SELECT "id", "jobTitle" FROM ${PERSON_TABLE} ORDER BY "id" LIMIT 2`,
    );

    await global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "jobTitle" = CASE "id" WHEN $1 THEN 'Paris office' ELSE 'London office' END WHERE "id" = ANY($2)`,
      [originalPeople[0].id, originalPeople.map(({ id }) => id)],
    );
  });

  afterAll(async () => {
    for (const { id, jobTitle } of originalPeople) {
      await global.testDataSource.query(
        `UPDATE ${PERSON_TABLE} SET "jobTitle" = $1 WHERE "id" = $2`,
        [jobTitle, id],
      );
    }

    await global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "_accessGroupIds" = NULL`,
    );
    await global.testDataSource.query(`DELETE FROM ${ACCESS_GROUP_TABLE}`);
  });

  it('should give records the groups whose rule they match', async () => {
    const roleLabel = 'Access group ids on records';
    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: roleLabel,
        description: roleLabel,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: true,
        canDestroyAllObjectRecords: true,
      },
    });
    const roleId = data.createOneRole.id;
    const predicateGroupId = v4();
    let isRoleDeleted = false;
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
              id: v4(),
              fieldMetadataId: jobTitleFieldMetadataId,
              operand: RowLevelPermissionPredicateOperand.CONTAINS,
              value,
              rowLevelPermissionPredicateGroupId: predicateGroupId,
            },
          ],
        },
      });

    try {
      await upsertRule('Paris');
      await syncAndRecompute();

      const [adminCompactId] = await readCompactIds({
        roleLabel: 'Admin',
        predicateGroupId: null,
      });
      const [parisCompactId] = await readCompactIds({
        roleLabel,
        predicateGroupId,
      });
      const [parisPerson, londonPerson] = await readPeople();

      expect(parisPerson.accessGroupIds).toEqual(
        expect.arrayContaining([adminCompactId, parisCompactId]),
      );
      expect(londonPerson.accessGroupIds).toContain(adminCompactId);
      expect(londonPerson.accessGroupIds).not.toContain(parisCompactId);

      await upsertRule('London');
      await syncAndRecompute();

      const [londonCompactId] = await readCompactIds({
        roleLabel,
        predicateGroupId,
      });
      const [parisPersonAfterEdit, londonPersonAfterEdit] = await readPeople();

      expect(parisPersonAfterEdit.accessGroupIds).not.toContain(parisCompactId);
      expect(parisPersonAfterEdit.accessGroupIds).not.toContain(
        londonCompactId,
      );
      expect(londonPersonAfterEdit.accessGroupIds).toContain(londonCompactId);

      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: roleId },
      });
      isRoleDeleted = true;
      await syncAndRecompute([londonCompactId]);

      const [, londonPersonAfterDelete] = await readPeople();

      expect(londonPersonAfterDelete.accessGroupIds).not.toContain(
        londonCompactId,
      );
      expect(londonPersonAfterDelete.accessGroupIds).toContain(adminCompactId);
    } finally {
      if (!isRoleDeleted) {
        await deleteOneRole({
          expectToFail: false,
          input: { idToDelete: roleId },
        });
      }
    }
  });
});
