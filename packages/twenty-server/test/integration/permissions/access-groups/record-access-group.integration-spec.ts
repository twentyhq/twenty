import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { revokeObjectRecordsPermissions } from 'test/integration/metadata/suites/object-permission/utils/revoke-object-records-permissions.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  FeatureFlagKey,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const SCHEMA = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"`;
const ACCESS_GROUP_TABLE = `${SCHEMA}."accessGroup"`;
const PERSON_TABLE = `${SCHEMA}."person"`;

const RULE_GRANTS = {
  canCreateRecords: true,
  canReadRecords: true,
  canUpdateRecords: true,
  canSoftDeleteRecords: true,
  canDestroyRecords: true,
};

type PersonRow = { id: string; jobTitle: string; accessGroupIds: number[] };

describe('access group ids on records (integration)', () => {
  let accessGroupSyncService: AccessGroupSyncService;
  let recordAccessGroupComputationService: RecordAccessGroupComputationService;
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
          AND "accessGroup"."rowLevelPermissionPredicateGroupId" IS NOT DISTINCT FROM (
            SELECT "rowLevelPermissionRuleId" FROM core."rowLevelPermissionPredicateGroup" WHERE "id" = $3
          )`,
      [roleLabel, objectMetadataId, predicateGroupId],
    );

    return rows.map(({ compactId }) => compactId);
  };

  const syncAndRecompute = async () => {
    await accessGroupSyncService.syncAccessGroups(SEED_APPLE_WORKSPACE_ID);
    await recordAccessGroupComputationService.recomputeRecordAccessGroupIdsOfAllObjectRecords(
      {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        objectMetadataId,
      },
    );
  };

  beforeAll(async () => {
    accessGroupSyncService = getAppProviderByClassName<AccessGroupSyncService>(
      'AccessGroupSyncService',
    );
    recordAccessGroupComputationService =
      getAppProviderByClassName<RecordAccessGroupComputationService>(
        'RecordAccessGroupComputationService',
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

  it('should leave records of an object without rules untouched', async () => {
    await global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "_accessGroupIds" = NULL WHERE "id" = ANY($1)`,
      [originalPeople.map(({ id }) => id)],
    );
    await syncAndRecompute();

    for (const person of await readPeople()) {
      expect(person.accessGroupIds).toBeNull();
    }
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

    await revokeObjectRecordsPermissions({ roleId, objectMetadataId });
    const upsertRule = (value: string) =>
      upsertRowLevelPermissionPredicates({
        expectToFail: false,
        input: {
          roleId,
          objectMetadataId,
          ...RULE_GRANTS,
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
    } finally {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: roleId },
      });
    }
  });

  it('should recompute the groups of a record when it is created or updated', async () => {
    const roleLabel = 'Access group ids on record writes';
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

    await revokeObjectRecordsPermissions({ roleId, objectMetadataId });
    let createdPersonId: string | undefined;

    await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId,
        ...RULE_GRANTS,
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
            value: 'Paris',
            rowLevelPermissionPredicateGroupId: predicateGroupId,
          },
        ],
      },
    });
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
      value: true,
      expectToFail: false,
    });

    try {
      await syncAndRecompute();

      const [parisCompactId] = await readCompactIds({
        roleLabel,
        predicateGroupId,
      });
      const readCreatedPersonAccessGroupIds = async (): Promise<number[]> => {
        const [{ accessGroupIds }] = await global.testDataSource.query(
          `SELECT "_accessGroupIds" AS "accessGroupIds" FROM ${PERSON_TABLE} WHERE "id" = $1`,
          [createdPersonId],
        );

        return accessGroupIds;
      };

      const { data: createData } = await createOneOperation<{
        id: string;
        jobTitle: string;
      }>({
        objectMetadataSingularName: 'person',
        input: { id: v4(), jobTitle: 'Paris office' },
      });

      createdPersonId = createData.createOneResponse.id;

      expect(await readCreatedPersonAccessGroupIds()).toContain(parisCompactId);

      await makeGraphqlApiRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          recordId: createdPersonId,
          data: { jobTitle: 'Berlin office' },
        }),
      );

      expect(await readCreatedPersonAccessGroupIds()).not.toContain(
        parisCompactId,
      );
    } finally {
      if (isDefined(createdPersonId)) {
        await global.testDataSource.query(
          `DELETE FROM ${PERSON_TABLE} WHERE "id" = $1`,
          [createdPersonId],
        );
      }
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
        value: false,
        expectToFail: false,
      });
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: roleId },
      });
    }
  });
});
