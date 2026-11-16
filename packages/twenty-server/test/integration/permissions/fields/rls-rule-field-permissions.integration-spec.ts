import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { upsertFieldPermissions } from 'test/integration/metadata/suites/field-permission/utils/upsert-field-permissions.util';
import { revokeObjectRecordsPermissions } from 'test/integration/metadata/suites/object-permission/utils/revoke-object-records-permissions.util';
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

import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const SCHEMA = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"`;
const PERSON_TABLE = `${SCHEMA}."person"`;
const RECORD_SHARE_TABLE = `${SCHEMA}."recordShare"`;

describe('field permissions on an RLS rule (integration)', () => {
  let objectMetadataId: string;
  let avatarUrlFieldMetadataId: string;
  let originalPeople: { id: string; jobTitle: string; avatarUrl: string }[];
  let originalMemberRoleId: string;
  let roleId: string;
  let rlsRuleId: string;

  const findFieldMetadataId = async (name: string): Promise<string> => {
    const [{ id }] = await global.testDataSource.query(
      `SELECT "id" FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND "name" = $2`,
      [objectMetadataId, name],
    );

    return id;
  };

  const listPeopleAsMember = async (): Promise<
    { id: string; avatarUrl: string; jobTitle: string }[]
  > => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id avatarUrl jobTitle',
        filter: { id: { in: originalPeople.map(({ id }) => id) } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.people.edges.map(
      (edge: { node: { id: string; avatarUrl: string; jobTitle: string } }) =>
        edge.node,
    );
  };

  beforeAll(async () => {
    [{ id: objectMetadataId }] = await global.testDataSource.query(
      `SELECT "id" FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = 'person'`,
      [SEED_APPLE_WORKSPACE_ID],
    );
    avatarUrlFieldMetadataId = await findFieldMetadataId('avatarUrl');

    originalPeople = await global.testDataSource.query(
      `SELECT "id", "jobTitle", "avatarUrl" FROM ${PERSON_TABLE} WHERE "deletedAt" IS NULL ORDER BY "id" LIMIT 2`,
    );
    await global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "avatarUrl" = 'Secret avatar', "jobTitle" = CASE "id" WHEN $1 THEN 'Paris office' ELSE 'London office' END WHERE "id" = ANY($2)`,
      [originalPeople[0].id, originalPeople.map(({ id }) => id)],
    );

    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'RLS rule field permissions',
        description: 'RLS rule field permissions',
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    roleId = data.createOneRole.id;
    rlsRuleId = v4();

    await revokeObjectRecordsPermissions({ roleId, objectMetadataId });
    await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId,
        canReadRecords: true,
        predicateGroups: [
          {
            id: rlsRuleId,
            objectMetadataId,
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
          },
        ],
        predicates: [
          {
            id: v4(),
            fieldMetadataId: await findFieldMetadataId('jobTitle'),
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value: 'Paris',
            rowLevelPermissionPredicateGroupId: rlsRuleId,
          },
        ],
      },
    });

    await upsertFieldPermissions({
      expectToFail: false,
      input: {
        roleId,
        fieldPermissions: [
          {
            objectMetadataId,
            fieldMetadataId: avatarUrlFieldMetadataId,
            rowLevelPermissionPredicateGroupId: rlsRuleId,
            canReadFieldValue: false,
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

    for (const { id, jobTitle, avatarUrl } of originalPeople) {
      await global.testDataSource.query(
        `UPDATE ${PERSON_TABLE} SET "jobTitle" = $1, "avatarUrl" = $2 WHERE "id" = $3`,
        [jobTitle, avatarUrl, id],
      );
    }
  });

  it('should read the unreadable field as empty on a record the RLS rule matches', async () => {
    expect(await listPeopleAsMember()).toEqual([
      { id: originalPeople[0].id, avatarUrl: '', jobTitle: 'Paris office' },
    ]);
  });

  it('should keep the field on a record reached through a share', async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      value: true,
      expectToFail: false,
    });
    await global.testDataSource.query(
      `INSERT INTO ${RECORD_SHARE_TABLE} ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
       VALUES ($1, $2, $3, 'WORKSPACE_MEMBER', 'READ', 'MANUAL', $2)`,
      [
        objectMetadataId,
        originalPeople[1].id,
        WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      ],
    );

    try {
      const people = await listPeopleAsMember();

      expect(people).toHaveLength(2);
      expect(
        people.find(({ id }) => id === originalPeople[0].id)?.avatarUrl,
      ).toBe('');
      expect(
        people.find(({ id }) => id === originalPeople[1].id)?.avatarUrl,
      ).toBe('Secret avatar');
    } finally {
      await global.testDataSource.query(
        `DELETE FROM ${RECORD_SHARE_TABLE} WHERE "recordId" = $1`,
        [originalPeople[1].id],
      );
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
        value: false,
        expectToFail: false,
      });
    }
  });

  it('should keep rule rows out of the role object level field permissions', async () => {
    const [{ count }] = await global.testDataSource.query(
      `SELECT COUNT(*) AS count FROM core."fieldPermission" WHERE "roleId" = $1 AND "rowLevelPermissionPredicateGroupId" = $2`,
      [roleId, rlsRuleId],
    );

    expect(Number(count)).toBe(1);

    const { errors } = await upsertFieldPermissions({
      expectToFail: false,
      input: {
        roleId,
        fieldPermissions: [
          {
            objectMetadataId,
            fieldMetadataId: avatarUrlFieldMetadataId,
            canUpdateFieldValue: false,
          },
        ],
      },
    });

    expect(errors).toBeUndefined();

    const rows = await global.testDataSource.query(
      `SELECT "rowLevelPermissionPredicateGroupId" AS "rlsRuleId" FROM core."fieldPermission" WHERE "roleId" = $1 AND "fieldMetadataId" = $2 ORDER BY "createdAt"`,
      [roleId, avatarUrlFieldMetadataId],
    );

    expect(rows).toEqual([{ rlsRuleId }, { rlsRuleId: null }]);

    const { errors: updateErrors } = await upsertFieldPermissions({
      expectToFail: false,
      input: {
        roleId,
        fieldPermissions: [
          {
            objectMetadataId,
            fieldMetadataId: avatarUrlFieldMetadataId,
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ],
      },
    });

    expect(updateErrors).toBeUndefined();

    await upsertFieldPermissions({
      expectToFail: false,
      input: {
        roleId,
        fieldPermissions: [
          {
            objectMetadataId,
            fieldMetadataId: avatarUrlFieldMetadataId,
            canReadFieldValue: null,
            canUpdateFieldValue: null,
          },
        ],
      },
    });
  });

  it('should keep field permissions working after a rule is removed', async () => {
    const removedRuleId = v4();
    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Removed rule field permissions',
        description: 'Removed rule field permissions',
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });
    const removedRuleRoleId = data.createOneRole.id;

    try {
      await upsertRowLevelPermissionPredicates({
        expectToFail: false,
        input: {
          roleId: removedRuleRoleId,
          objectMetadataId,
          predicateGroups: [
            {
              id: removedRuleId,
              objectMetadataId,
              logicalOperator:
                RowLevelPermissionPredicateGroupLogicalOperator.AND,
            },
          ],
          predicates: [
            {
              id: v4(),
              fieldMetadataId: await findFieldMetadataId('jobTitle'),
              operand: RowLevelPermissionPredicateOperand.CONTAINS,
              value: 'Paris',
              rowLevelPermissionPredicateGroupId: removedRuleId,
            },
          ],
        },
      });
      await upsertFieldPermissions({
        expectToFail: false,
        input: {
          roleId: removedRuleRoleId,
          fieldPermissions: [
            {
              objectMetadataId,
              fieldMetadataId: avatarUrlFieldMetadataId,
              rowLevelPermissionPredicateGroupId: removedRuleId,
              canReadFieldValue: false,
            },
          ],
        },
      });
      await upsertRowLevelPermissionPredicates({
        expectToFail: false,
        input: {
          roleId: removedRuleRoleId,
          objectMetadataId,
          predicateGroups: [],
          predicates: [],
        },
      });

      const { errors } = await upsertFieldPermissions({
        expectToFail: false,
        input: {
          roleId: removedRuleRoleId,
          fieldPermissions: [
            {
              objectMetadataId,
              fieldMetadataId: avatarUrlFieldMetadataId,
              canUpdateFieldValue: false,
            },
          ],
        },
      });

      expect(errors).toBeUndefined();
      expect(await listPeopleAsMember()).toHaveLength(1);
    } finally {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: removedRuleRoleId },
      });
    }
  });

  it('should add up object level and RLS rule unreadable fields', async () => {
    const jobTitleResponse = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id avatarUrl',
        filter: { id: { in: [originalPeople[0].id] } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(jobTitleResponse.body.data.people.edges[0].node.avatarUrl).toBe('');

    const linkedinFieldMetadataId = await findFieldMetadataId('linkedinLink');

    await upsertFieldPermissions({
      expectToFail: false,
      input: {
        roleId,
        fieldPermissions: [
          {
            objectMetadataId,
            fieldMetadataId: linkedinFieldMetadataId,
            canReadFieldValue: false,
          },
        ],
      },
    });

    try {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: 'id linkedinLink { primaryLinkUrl }',
          filter: { id: { in: [originalPeople[0].id] } },
        }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(response.body.errors).toBeDefined();
    } finally {
      await upsertFieldPermissions({
        expectToFail: false,
        input: {
          roleId,
          fieldPermissions: [
            {
              objectMetadataId,
              fieldMetadataId: linkedinFieldMetadataId,
              canReadFieldValue: null,
            },
          ],
        },
      });
    }
  });

  it('should reject an update of an RLS rule uneditable field on a record it matches', async () => {
    await global.testDataSource.query(
      `UPDATE core."rowLevelPermissionRule" SET "canUpdateRecords" = TRUE WHERE "roleId" = $1`,
      [roleId],
    );
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['rolesPermissions']);

    try {
      const response = await makeGraphqlApiRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          recordId: originalPeople[0].id,
          data: { avatarUrl: 'changed' },
        }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(response.body.errors).toBeDefined();

      const [{ avatarUrl }] = await global.testDataSource.query(
        `SELECT "avatarUrl" FROM ${PERSON_TABLE} WHERE "id" = $1`,
        [originalPeople[0].id],
      );

      expect(avatarUrl).toBe('Secret avatar');
    } finally {
      await global.testDataSource.query(
        `UPDATE core."rowLevelPermissionRule" SET "canUpdateRecords" = FALSE WHERE "roleId" = $1`,
        [roleId],
      );
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['rolesPermissions']);
    }
  });

  it('should reject a relation field', async () => {
    const { errors } = await upsertFieldPermissions({
      expectToFail: true,
      input: {
        roleId,
        fieldPermissions: [
          {
            objectMetadataId,
            fieldMetadataId: await findFieldMetadataId('company'),
            rowLevelPermissionPredicateGroupId: rlsRuleId,
            canReadFieldValue: false,
          },
        ],
      },
    });

    expect(errors).toBeDefined();
  });

  it('should reject a rule that belongs to another role', async () => {
    const { errors } = await upsertFieldPermissions({
      expectToFail: true,
      input: {
        roleId: originalMemberRoleId,
        fieldPermissions: [
          {
            objectMetadataId,
            fieldMetadataId: avatarUrlFieldMetadataId,
            rowLevelPermissionPredicateGroupId: rlsRuleId,
            canReadFieldValue: false,
          },
        ],
      },
    });

    expect(errors).toBeDefined();
  });
});
