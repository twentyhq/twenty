import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  FeatureFlagKey,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type AccessGroupService } from 'src/engine/permissions/internal/access-group/services/access-group.service';
import { type RecordAccessGroupService } from 'src/engine/permissions/internal/access-group/services/record-access-group.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const SCHEMA = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"`;
const ACCESS_GROUP_TABLE = `${SCHEMA}."accessGroup"`;
const PERSON_TABLE = `${SCHEMA}."person"`;

describe('querying many records through access groups (integration)', () => {
  let objectMetadataId: string;
  let originalPeople: { id: string; jobTitle: string }[];
  let originalMemberRoleId: string;
  let roleId: string;

  const parisPersonId = () => originalPeople[0].id;

  const findPersonIdsAsMember = async (): Promise<string[]> => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: { id: { in: originalPeople.map(({ id }) => id) } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.people.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );
  };

  const setAccessGroupsEnabled = (value: boolean) =>
    updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
      value,
      expectToFail: false,
    });

  beforeAll(async () => {
    [{ id: objectMetadataId }] = await global.testDataSource.query(
      `SELECT "id" FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = 'person'`,
      [SEED_APPLE_WORKSPACE_ID],
    );
    const [{ id: jobTitleFieldMetadataId }] = await global.testDataSource.query(
      `SELECT "id" FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND "name" = 'jobTitle'`,
      [objectMetadataId],
    );

    originalPeople = await global.testDataSource.query(
      `SELECT "id", "jobTitle" FROM ${PERSON_TABLE} WHERE "deletedAt" IS NULL ORDER BY "id" LIMIT 2`,
    );
    await global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "jobTitle" = CASE "id" WHEN $1 THEN 'Paris office' ELSE 'London office' END WHERE "id" = ANY($2)`,
      [parisPersonId(), originalPeople.map(({ id }) => id)],
    );

    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Querying through access groups',
        description: 'Querying through access groups',
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    roleId = data.createOneRole.id;

    const predicateGroupId = v4();

    await upsertRowLevelPermissionPredicates({
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
            value: 'Paris',
            rowLevelPermissionPredicateGroupId: predicateGroupId,
          },
        ],
      },
    });

    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        roleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    });
    await setAccessGroupsEnabled(true);
    await getAppProviderByClassName<AccessGroupService>(
      'AccessGroupService',
    ).syncAccessGroups(SEED_APPLE_WORKSPACE_ID);
    await getAppProviderByClassName<RecordAccessGroupService>(
      'RecordAccessGroupService',
    ).recomputeRecordAccessGroupIdsOfAllObjectRecords({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadataId,
    });
  });

  afterAll(async () => {
    await setAccessGroupsEnabled(false);
    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        roleId: originalMemberRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    });
    await deleteOneRole({ expectToFail: false, input: { idToDelete: roleId } });

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

  it('should return the records the rule reaches', async () => {
    expect(await findPersonIdsAsMember()).toEqual([parisPersonId()]);
  });

  it('should read the stored groups rather than the rule', async () => {
    const [{ accessGroupIds }] = await global.testDataSource.query(
      `SELECT "_accessGroupIds" AS "accessGroupIds" FROM ${PERSON_TABLE} WHERE "id" = $1`,
      [parisPersonId()],
    );

    await global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "_accessGroupIds" = '{}' WHERE "id" = $1`,
      [parisPersonId()],
    );

    try {
      expect(await findPersonIdsAsMember()).toEqual([]);

      await setAccessGroupsEnabled(false);

      expect(await findPersonIdsAsMember()).toEqual([parisPersonId()]);
    } finally {
      await setAccessGroupsEnabled(true);
      await global.testDataSource.query(
        `UPDATE ${PERSON_TABLE} SET "_accessGroupIds" = $1 WHERE "id" = $2`,
        [accessGroupIds, parisPersonId()],
      );
    }
  });
});
