import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { upsertRowLevelPermissionRules } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-rules.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const PERSON_TABLE = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"."person"`;

type StoredPerson = {
  id: string;
  jobTitle: string;
  avatarUrl: string;
  deletedAt: string | null;
};

describe('mutations on a record the role can see but its rules do not let it change', () => {
  let originalPeople: StoredPerson[];
  let parisPersonId: string;
  let londonPersonId: string;
  let originalMemberRoleId: string;
  let roleId: string;

  const findStoredPeople = async (): Promise<StoredPerson[]> =>
    global.testDataSource.query(
      `SELECT "id", "jobTitle", "avatarUrl", "deletedAt" FROM ${PERSON_TABLE} WHERE "id" = ANY($1) ORDER BY "id"`,
      [originalPeople.map(({ id }) => id)],
    );

  const updatePersonAvatarUrlAsMember = (recordId: string) =>
    makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id avatarUrl',
        data: { avatarUrl: 'Updated by member' },
        recordId,
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

  beforeAll(async () => {
    const [{ id: objectMetadataId }] = await global.testDataSource.query(
      `SELECT "id" FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = 'person'`,
      [SEED_APPLE_WORKSPACE_ID],
    );
    const [{ id: jobTitleFieldMetadataId }] = await global.testDataSource.query(
      `SELECT "id" FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND "name" = 'jobTitle'`,
      [objectMetadataId],
    );

    originalPeople = await global.testDataSource.query(
      `SELECT "id", "jobTitle", "avatarUrl", "deletedAt" FROM ${PERSON_TABLE} WHERE "deletedAt" IS NULL ORDER BY "id" LIMIT 2`,
    );
    [parisPersonId, londonPersonId] = originalPeople.map(({ id }) => id);

    await global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "jobTitle" = CASE "id" WHEN $1 THEN 'Paris office' ELSE 'London office' END WHERE "id" = ANY($2)`,
      [parisPersonId, [parisPersonId, londonPersonId]],
    );

    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Edit Paris people only',
        description: 'Edit Paris people only',
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    roleId = data.createOneRole.id;

    await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId,
        rules: [
          {
            canReadRecords: true,
            canUpdateRecords: true,
            canSoftDeleteRecords: true,
            predicateGroups: [
              {
                id: v4(),
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

    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        roleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    });
  });

  afterAll(async () => {
    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        roleId: originalMemberRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    });
    await deleteOneRole({ expectToFail: false, input: { idToDelete: roleId } });

    for (const { id, jobTitle, avatarUrl, deletedAt } of originalPeople) {
      await global.testDataSource.query(
        `UPDATE ${PERSON_TABLE} SET "jobTitle" = $1, "avatarUrl" = $2, "deletedAt" = $3 WHERE "id" = $4`,
        [jobTitle, avatarUrl, deletedAt, id],
      );
    }
  });

  it('should reject updating a record outside the rule with RECORD_NOT_EDITABLE', async () => {
    const storedPeopleBefore = await findStoredPeople();

    const response = await updatePersonAvatarUrlAsMember(londonPersonId);

    expect(response.body.errors[0].extensions).toMatchObject({
      code: 'FORBIDDEN',
      subCode: 'RECORD_NOT_EDITABLE',
    });
    expect(await findStoredPeople()).toEqual(storedPeopleBefore);
  });

  it('should reject deleting a record outside the rule with RECORD_NOT_EDITABLE', async () => {
    const response = await makeGraphqlApiRequest(
      deleteOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        recordId: londonPersonId,
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors[0].extensions).toMatchObject({
      code: 'FORBIDDEN',
      subCode: 'RECORD_NOT_EDITABLE',
    });

    const londonPerson = (await findStoredPeople()).find(
      ({ id }) => id === londonPersonId,
    );

    expect(londonPerson?.deletedAt).toBeNull();
  });

  it('should update a record the rule lets the role change', async () => {
    const response = await updatePersonAvatarUrlAsMember(parisPersonId);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updatePerson).toEqual({
      id: parisPersonId,
      avatarUrl: 'Updated by member',
    });
  });

  it('should keep RECORD_NOT_FOUND for a record that does not exist', async () => {
    const response = await updatePersonAvatarUrlAsMember(v4());

    expect(response.body.errors[0].extensions).toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('should only change the records the role may change in a batch by ids', async () => {
    const response = await makeGraphqlApiRequest(
      updateManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        data: { avatarUrl: 'Updated in batch' },
        filter: { id: { in: [parisPersonId, londonPersonId] } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updatePeople).toEqual([{ id: parisPersonId }]);
  });
});
