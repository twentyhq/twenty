import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { upsertRowLevelPermissionRules } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-rules.util';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const WORKSPACE_SCHEMA = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"`;
const OPPORTUNITY_NAME_PREFIX = 'Relation target readability';

type StoredPerson = { id: string; jobTitle: string };

describe('linking a record to a record the role cannot read', () => {
  let originalPeople: StoredPerson[];
  let parisPersonId: string;
  let londonPersonId: string;
  let originalMemberRoleId: string;
  let roleId: string;

  const createOpportunityAsMember = (pointOfContactId: string) =>
    makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        gqlFields: 'id',
        data: {
          id: v4(),
          name: `${OPPORTUNITY_NAME_PREFIX} ${pointOfContactId}`,
          pointOfContactId,
        },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

  const updateOpportunityAsMember = ({
    opportunityId,
    data,
  }: {
    opportunityId: string;
    data: object;
  }) =>
    makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        gqlFields: 'id',
        recordId: opportunityId,
        data,
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

  const findPointOfContactId = async (
    opportunityId: string,
  ): Promise<string | null> => {
    const [{ pointOfContactId }] = await global.testDataSource.query(
      `SELECT "pointOfContactId" FROM ${WORKSPACE_SCHEMA}."opportunity" WHERE "id" = $1`,
      [opportunityId],
    );

    return pointOfContactId;
  };

  beforeAll(async () => {
    const [{ id: personObjectMetadataId }] = await global.testDataSource.query(
      `SELECT "id" FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = 'person'`,
      [SEED_APPLE_WORKSPACE_ID],
    );
    const [{ id: jobTitleFieldMetadataId }] = await global.testDataSource.query(
      `SELECT "id" FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND "name" = 'jobTitle'`,
      [personObjectMetadataId],
    );

    originalPeople = await global.testDataSource.query(
      `SELECT "id", "jobTitle" FROM ${WORKSPACE_SCHEMA}."person" WHERE "deletedAt" IS NULL ORDER BY "id" LIMIT 2`,
    );
    [parisPersonId, londonPersonId] = originalPeople.map(({ id }) => id);

    await global.testDataSource.query(
      `UPDATE ${WORKSPACE_SCHEMA}."person" SET "jobTitle" = CASE "id" WHEN $1 THEN 'Paris office' ELSE 'London office' END WHERE "id" = ANY($2)`,
      [parisPersonId, [parisPersonId, londonPersonId]],
    );

    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Read Paris people only',
        description: 'Read Paris people only',
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    roleId = data.createOneRole.id;

    await upsertObjectPermissions({
      expectToFail: false,
      input: {
        roleId,
        objectPermissions: [
          {
            objectMetadataId: personObjectMetadataId,
            canReadObjectRecords: false,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
        ],
      },
    });

    await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId: personObjectMetadataId,
        rules: [
          {
            canReadRecords: true,
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
    await global.testDataSource.query(
      `DELETE FROM ${WORKSPACE_SCHEMA}."opportunity" WHERE "name" LIKE $1`,
      [`${OPPORTUNITY_NAME_PREFIX}%`],
    );

    for (const { id, jobTitle } of originalPeople) {
      await global.testDataSource.query(
        `UPDATE ${WORKSPACE_SCHEMA}."person" SET "jobTitle" = $1 WHERE "id" = $2`,
        [jobTitle, id],
      );
    }
  });

  it('should create a record whose relation targets a record the role can read', async () => {
    const response = await createOpportunityAsMember(parisPersonId);

    expect(response.body.errors).toBeUndefined();
  });

  it('should refuse to create a record whose relation targets a record the role cannot read', async () => {
    const response = await createOpportunityAsMember(londonPersonId);

    expect(response.body.errors[0].message).toBe(
      'Relation target record is not readable by your current role',
    );

    const [{ count }] = await global.testDataSource.query(
      `SELECT COUNT(*)::int AS "count" FROM ${WORKSPACE_SCHEMA}."opportunity" WHERE "pointOfContactId" = $1 AND "name" LIKE $2`,
      [londonPersonId, `${OPPORTUNITY_NAME_PREFIX}%`],
    );

    expect(count).toBe(0);
  });

  it('should refuse to link an existing record to a record the role cannot read', async () => {
    const createResponse = await createOpportunityAsMember(parisPersonId);
    const opportunityId = createResponse.body.data.createOpportunity.id;

    const response = await updateOpportunityAsMember({
      opportunityId,
      data: { pointOfContactId: londonPersonId },
    });

    expect(response.body.errors[0].message).toBe(
      'Relation target record is not readable by your current role',
    );
    expect(await findPointOfContactId(opportunityId)).toBe(parisPersonId);
  });

  it('should still update other fields of a record whose relation already targets a record the role cannot read', async () => {
    const createResponse = await createOpportunityAsMember(parisPersonId);
    const opportunityId = createResponse.body.data.createOpportunity.id;

    await global.testDataSource.query(
      `UPDATE ${WORKSPACE_SCHEMA}."opportunity" SET "pointOfContactId" = $1 WHERE "id" = $2`,
      [londonPersonId, opportunityId],
    );

    const response = await updateOpportunityAsMember({
      opportunityId,
      data: {
        name: `${OPPORTUNITY_NAME_PREFIX} renamed`,
        pointOfContactId: londonPersonId,
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(await findPointOfContactId(opportunityId)).toBe(londonPersonId);
  });
});
