import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { revokeObjectRecordsPermissions } from 'test/integration/metadata/suites/object-permission/utils/revoke-object-records-permissions.util';
import { upsertRowLevelPermissionRules } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-rules.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findRoleAccessGroupCompactIds } from 'test/integration/permissions/utils/find-role-access-group-compact-ids.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
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
  const [parisPersonId, londonPersonId] = [v4(), v4()].sort();
  const people: Pick<PersonRow, 'id' | 'jobTitle'>[] = [
    { id: parisPersonId, jobTitle: 'Paris office' },
    { id: londonPersonId, jobTitle: 'London office' },
  ];

  const readPeople = (): Promise<PersonRow[]> =>
    global.testDataSource.query(
      `SELECT "id", "jobTitle", "_accessGroupIds" AS "accessGroupIds" FROM ${PERSON_TABLE} WHERE "id" = ANY($1) ORDER BY "id"`,
      [people.map(({ id }) => id)],
    );

  const readCompactIds = async ({
    roleLabel,
  }: {
    roleLabel: string;
  }): Promise<number[]> => {
    const [{ id: roleId }] = await global.testDataSource.query(
      `SELECT "id" FROM core."role" WHERE "workspaceId" = $1 AND "label" = $2`,
      [SEED_APPLE_WORKSPACE_ID, roleLabel],
    );

    return findRoleAccessGroupCompactIds({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      roleId,
      objectMetadataId,
    });
  };

  const syncAndRecompute = async () => {
    await accessGroupSyncService.syncAccessGroups({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
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
    for (const person of people) {
      await createOneOperation({
        objectMetadataSingularName: 'person',
        input: person,
      });
    }
  });

  afterAll(async () => {
    await global.testDataSource.query(
      `DELETE FROM ${PERSON_TABLE} WHERE "id" = ANY($1)`,
      [people.map(({ id }) => id)],
    );

    await global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "_accessGroupIds" = NULL`,
    );
    await global.testDataSource.query(`DELETE FROM ${ACCESS_GROUP_TABLE}`);
  });

  it('should leave records of an object without rules untouched', async () => {
    await global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "_accessGroupIds" = NULL WHERE "id" = ANY($1)`,
      [people.map(({ id }) => id)],
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
    const ruleId = v4();
    const predicateGroupId = v4();

    await revokeObjectRecordsPermissions({ roleId, objectMetadataId });
    const upsertRule = (value: string) =>
      upsertRowLevelPermissionRules({
        expectToFail: false,
        input: {
          roleId,
          objectMetadataId,
          rules: [
            {
              id: ruleId,
              ...RULE_GRANTS,
              predicateGroups: [
                {
                  id: predicateGroupId,
                  logicalOperator:
                    RowLevelPermissionPredicateGroupLogicalOperator.AND,
                  predicates: [
                    {
                      id: v4(),
                      fieldMetadataId: jobTitleFieldMetadataId,
                      operand: RowLevelPermissionPredicateOperand.CONTAINS,
                      value,
                    },
                  ],
                },
              ],
            },
          ],
        },
      });

    try {
      await upsertRule('Paris');
      await syncAndRecompute();

      const [adminCompactId] = await readCompactIds({
        roleLabel: 'Admin',
      });
      const [parisCompactId] = await readCompactIds({
        roleLabel,
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

  it('should recompute the groups of a record when it is created or updated, including by a system write in the lite context', async () => {
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
    const systemCreatedPersonId = v4();

    await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId,
        rules: [
          {
            ...RULE_GRANTS,
            predicateGroups: [
              {
                id: predicateGroupId,
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.AND,
                predicates: [
                  {
                    id: v4(),
                    fieldMetadataId: jobTitleFieldMetadataId,
                    operand: RowLevelPermissionPredicateOperand.CONTAINS,
                    value: 'Paris',
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    try {
      await syncAndRecompute();

      const [parisCompactId] = await readCompactIds({
        roleLabel,
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

      const workspaceOrmManager =
        getAppProviderByClassName<WorkspaceOrmManager>('WorkspaceOrmManager');

      await workspaceOrmManager.executeInWorkspaceContext(
        () =>
          workspaceOrmManager.runInWorkspaceTransaction((transactionScope) =>
            transactionScope
              .getRepositoryWithoutPermissionChecks('person')
              .insert({ id: systemCreatedPersonId, jobTitle: 'Paris office' }),
          ),
        buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
        { lite: true },
      );

      const [{ accessGroupIds: systemCreatedPersonAccessGroupIds }] =
        await global.testDataSource.query(
          `SELECT "_accessGroupIds" AS "accessGroupIds" FROM ${PERSON_TABLE} WHERE "id" = $1`,
          [systemCreatedPersonId],
        );

      expect(systemCreatedPersonAccessGroupIds).toContain(parisCompactId);
    } finally {
      await global.testDataSource.query(
        `DELETE FROM ${PERSON_TABLE} WHERE "id" = ANY($1)`,
        [[createdPersonId, systemCreatedPersonId].filter(isDefined)],
      );
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: roleId },
      });
    }
  });
});
