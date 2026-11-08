import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
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
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const SCHEMA = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"`;
const PERSON_TABLE = `${SCHEMA}."person"`;
const COMPANY_TABLE = `${SCHEMA}."company"`;

describe('RLS rules through a relation (integration)', () => {
  let originalMemberRoleId: string;
  let roleIds: string[] = [];
  let personObjectMetadataId: string;
  let companyObjectMetadataId: string;
  let person: { id: string; jobTitle: string; companyId: string };
  let company: { id: string; name: string };
  let otherCompany: { id: string; name: string };

  const findFieldMetadataId = async ({
    objectMetadataId,
    name,
  }: {
    objectMetadataId: string;
    name: string;
  }): Promise<string> => {
    const [{ id }] = await global.testDataSource.query(
      `SELECT "id" FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND "name" = $2`,
      [objectMetadataId, name],
    );

    return id;
  };

  const setFlag = (featureFlag: FeatureFlagKey, value: boolean) =>
    updateFeatureFlag({ featureFlag, value, expectToFail: false });

  const assignRuleThroughRelation = async ({
    objectMetadataId,
    relationFieldMetadataId,
    fieldMetadataId,
    value,
  }: {
    objectMetadataId: string;
    relationFieldMetadataId: string;
    fieldMetadataId: string;
    value: string;
  }) => {
    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: `RLS hop ${v4()}`,
        description: 'RLS hop',
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });
    const roleId = data.createOneRole.id;

    await global.testDataSource.query(
      `UPDATE core."role" SET "canCreateAllObjectRecords" = TRUE WHERE "id" = $1`,
      [roleId],
    );
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['rolesPermissions']);
    const ruleId = v4();

    roleIds.push(roleId);

    await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId,
        predicateGroups: [
          {
            id: ruleId,
            objectMetadataId,
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
          },
        ],
        predicates: [
          {
            id: v4(),
            fieldMetadataId,
            relationFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value,
            rowLevelPermissionPredicateGroupId: ruleId,
          },
        ],
      },
    });
    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        roleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    });
    await getAppProviderByClassName<AccessGroupService>(
      'AccessGroupService',
    ).syncAccessGroups(SEED_APPLE_WORKSPACE_ID);
    await getAppProviderByClassName<RecordAccessGroupService>(
      'RecordAccessGroupService',
    ).recomputeRecordAccessGroupIdsOfAllObjectRecords({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadataId,
    });
  };

  const findIdsAsMember = async ({
    singular,
    plural,
    ids,
  }: {
    singular: string;
    plural: string;
    ids: string[];
  }): Promise<string[]> => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: singular,
        objectMetadataPluralName: plural,
        gqlFields: 'id',
        filter: { id: { in: ids } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data[plural].edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );
  };

  const updateAsAdmin = async ({
    singular,
    recordId,
    data,
  }: {
    singular: string;
    recordId: string;
    data: Record<string, unknown>;
  }) => {
    const response = await makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: singular,
        gqlFields: 'id',
        recordId,
        data,
      }),
    );

    expect(response.body.errors).toBeUndefined();
  };

  beforeAll(async () => {
    const objects: { id: string; nameSingular: string }[] =
      await global.testDataSource.query(
        `SELECT "id", "nameSingular" FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" IN ('person', 'company')`,
        [SEED_APPLE_WORKSPACE_ID],
      );

    personObjectMetadataId =
      objects.find(({ nameSingular }) => nameSingular === 'person')?.id ?? '';
    companyObjectMetadataId =
      objects.find(({ nameSingular }) => nameSingular === 'company')?.id ?? '';

    [person] = await global.testDataSource.query(
      `SELECT "id", "jobTitle", "companyId" FROM ${PERSON_TABLE} WHERE "deletedAt" IS NULL AND "companyId" IS NOT NULL ORDER BY "id" LIMIT 1`,
    );
    [company] = await global.testDataSource.query(
      `SELECT "id", "name" FROM ${COMPANY_TABLE} WHERE "id" = $1`,
      [person.companyId],
    );
    [otherCompany] = await global.testDataSource.query(
      `SELECT "id", "name" FROM ${COMPANY_TABLE} WHERE "deletedAt" IS NULL AND "id" <> $1 ORDER BY "id" LIMIT 1`,
      [person.companyId],
    );

    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    await setFlag(
      FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
      true,
    );
    await setFlag(FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED, true);
  });

  afterEach(async () => {
    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        roleId: originalMemberRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    });

    for (const idToDelete of roleIds) {
      await deleteOneRole({ expectToFail: false, input: { idToDelete } });
    }

    roleIds = [];

    await global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "jobTitle" = $1, "companyId" = $2 WHERE "id" = $3`,
      [person.jobTitle, person.companyId, person.id],
    );
    await global.testDataSource.query(
      `UPDATE ${COMPANY_TABLE} SET "name" = $1 WHERE "id" = $2`,
      [company.name, company.id],
    );
  });

  afterAll(async () => {
    await setFlag(FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED, false);
    await setFlag(
      FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
      false,
    );
    await global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "_accessGroupIds" = NULL`,
    );
    await global.testDataSource.query(
      `UPDATE ${COMPANY_TABLE} SET "_accessGroupIds" = NULL`,
    );
    await global.testDataSource.query(`DELETE FROM ${SCHEMA}."accessGroup"`);
  });

  it('should follow a many to one relation and its related record changes', async () => {
    await global.testDataSource.query(
      `UPDATE ${COMPANY_TABLE} SET "name" = 'Hop match' WHERE "id" = $1`,
      [company.id],
    );
    await assignRuleThroughRelation({
      objectMetadataId: personObjectMetadataId,
      relationFieldMetadataId: await findFieldMetadataId({
        objectMetadataId: personObjectMetadataId,
        name: 'company',
      }),
      fieldMetadataId: await findFieldMetadataId({
        objectMetadataId: companyObjectMetadataId,
        name: 'name',
      }),
      value: 'Hop match',
    });

    const findPerson = () =>
      findIdsAsMember({
        singular: 'person',
        plural: 'people',
        ids: [person.id],
      });

    expect(await findPerson()).toEqual([person.id]);

    await updateAsAdmin({
      singular: 'company',
      recordId: company.id,
      data: { name: 'No longer matching' },
    });

    expect(await findPerson()).toEqual([]);
  });

  it('should check creates and updates through the relation', async () => {
    await global.testDataSource.query(
      `UPDATE ${COMPANY_TABLE} SET "name" = 'Hop match' WHERE "id" = $1`,
      [company.id],
    );
    await assignRuleThroughRelation({
      objectMetadataId: personObjectMetadataId,
      relationFieldMetadataId: await findFieldMetadataId({
        objectMetadataId: personObjectMetadataId,
        name: 'company',
      }),
      fieldMetadataId: await findFieldMetadataId({
        objectMetadataId: companyObjectMetadataId,
        name: 'name',
      }),
      value: 'Hop match',
    });

    const createPerson = (companyId: string) =>
      makeGraphqlApiRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          data: { id: v4(), companyId },
        }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

    const accepted = await createPerson(company.id);
    const rejected = await createPerson(otherCompany.id);

    expect(accepted.body.errors).toBeUndefined();
    expect(rejected.body.errors).toBeDefined();

    const movedAway = await makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        recordId: person.id,
        data: { companyId: otherCompany.id },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(movedAway.body.errors).toBeDefined();

    await global.testDataSource.query(
      `DELETE FROM ${PERSON_TABLE} WHERE "id" = $1`,
      [accepted.body.data.createPerson.id],
    );
  });

  it('should follow a one to many relation and a related record moving away', async () => {
    await global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "jobTitle" = 'Hop title' WHERE "id" = $1`,
      [person.id],
    );
    await assignRuleThroughRelation({
      objectMetadataId: companyObjectMetadataId,
      relationFieldMetadataId: await findFieldMetadataId({
        objectMetadataId: companyObjectMetadataId,
        name: 'people',
      }),
      fieldMetadataId: await findFieldMetadataId({
        objectMetadataId: personObjectMetadataId,
        name: 'jobTitle',
      }),
      value: 'Hop title',
    });

    const findCompanies = () =>
      findIdsAsMember({
        singular: 'company',
        plural: 'companies',
        ids: [company.id, otherCompany.id],
      });

    expect(await findCompanies()).toEqual([company.id]);

    await updateAsAdmin({
      singular: 'person',
      recordId: person.id,
      data: { companyId: otherCompany.id },
    });

    expect(await findCompanies()).toEqual([otherCompany.id]);
  });
});
