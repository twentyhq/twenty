import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
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
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
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

  const findObjectMetadataId = async (
    nameSingular: string,
  ): Promise<string> => {
    const [{ id }] = await global.testDataSource.query(
      `SELECT "id" FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = $2`,
      [SEED_APPLE_WORKSPACE_ID, nameSingular],
    );

    return id;
  };

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
        label: `RLS relation ${v4()}`,
        description: 'RLS relation',
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
    await waitForAllJobsToFinish();
  };

  beforeAll(async () => {
    personObjectMetadataId = await findObjectMetadataId('person');
    companyObjectMetadataId = await findObjectMetadataId('company');

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

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
      value: true,
      expectToFail: false,
    });
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
      value: true,
      expectToFail: false,
    });
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
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
      value: false,
      expectToFail: false,
    });
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
      value: false,
      expectToFail: false,
    });
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
      `UPDATE ${COMPANY_TABLE} SET "name" = 'Relation match' WHERE "id" = $1`,
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
      value: 'Relation match',
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
      `UPDATE ${COMPANY_TABLE} SET "name" = 'Relation match' WHERE "id" = $1`,
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
      value: 'Relation match',
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
      `UPDATE ${PERSON_TABLE} SET "jobTitle" = 'Relation title' WHERE "id" = $1`,
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
      value: 'Relation title',
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

  it('should update the related record a system write moves away from', async () => {
    await global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "jobTitle" = 'Relation title' WHERE "id" = $1`,
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
      value: 'Relation title',
    });

    const workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    await workspaceOrmManager.executeInWorkspaceContext(async () => {
      const personRepository =
        workspaceOrmManager.getRepositoryWithoutPermissionChecks('person', {
          shouldSkipEventEmission: true,
        });

      await personRepository.update(person.id, { companyId: otherCompany.id });
    }, buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID));
    await waitForAllJobsToFinish();

    expect(
      await findIdsAsMember({
        singular: 'company',
        plural: 'companies',
        ids: [company.id, otherCompany.id],
      }),
    ).toEqual([otherCompany.id]);
  });

  it('should update related records when their related record is destroyed', async () => {
    const companyToDestroyId = v4();
    const personOfCompanyId = v4();

    await global.testDataSource.query(
      `INSERT INTO ${COMPANY_TABLE} ("id", "name") VALUES ($1, 'Relation destroy')`,
      [companyToDestroyId],
    );
    await global.testDataSource.query(
      `INSERT INTO ${PERSON_TABLE} ("id", "companyId") VALUES ($1, $2)`,
      [personOfCompanyId, companyToDestroyId],
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
      value: 'Relation destroy',
    });

    const findPerson = () =>
      findIdsAsMember({
        singular: 'person',
        plural: 'people',
        ids: [personOfCompanyId],
      });

    expect(await findPerson()).toEqual([personOfCompanyId]);

    const response = await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        recordId: companyToDestroyId,
      }),
    );

    expect(response.body.errors).toBeUndefined();
    await waitForAllJobsToFinish();
    expect(await findPerson()).toEqual([]);

    await global.testDataSource.query(
      `DELETE FROM ${PERSON_TABLE} WHERE "id" = $1`,
      [personOfCompanyId],
    );
  });

  it('should only update related records when a compared field is written', async () => {
    const [{ employees }] = await global.testDataSource.query(
      `SELECT "employees" FROM ${COMPANY_TABLE} WHERE "id" = $1`,
      [company.id],
    );
    const findPersonAccessGroupIds = async (): Promise<number[] | null> => {
      const [{ _accessGroupIds }] = await global.testDataSource.query(
        `SELECT "_accessGroupIds" FROM ${PERSON_TABLE} WHERE "id" = $1`,
        [person.id],
      );

      return _accessGroupIds;
    };

    await global.testDataSource.query(
      `UPDATE ${COMPANY_TABLE} SET "name" = 'Relation match' WHERE "id" = $1`,
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
      value: 'Relation match',
    });
    await global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "_accessGroupIds" = NULL WHERE "id" = $1`,
      [person.id],
    );

    await updateAsAdmin({
      singular: 'company',
      recordId: company.id,
      data: { employees: (employees ?? 0) + 1 },
    });

    expect(await findPersonAccessGroupIds()).toBeNull();

    await updateAsAdmin({
      singular: 'company',
      recordId: company.id,
      data: { name: 'Relation match again' },
    });

    expect(await findPersonAccessGroupIds()).not.toBeNull();

    await global.testDataSource.query(
      `UPDATE ${COMPANY_TABLE} SET "employees" = $1 WHERE "id" = $2`,
      [employees, company.id],
    );
  });

  it('should recompute through a job when a write covers many records', async () => {
    const personIds = Array.from({ length: 101 }, () => v4());

    await global.testDataSource.query(
      `UPDATE ${COMPANY_TABLE} SET "name" = 'Relation match' WHERE "id" = $1`,
      [company.id],
    );
    await global.testDataSource.query(
      `INSERT INTO ${PERSON_TABLE} ("id", "companyId") SELECT UNNEST($1::uuid[]), $2`,
      [personIds, otherCompany.id],
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
      value: 'Relation match',
    });

    const response = await makeGraphqlApiRequest(
      updateManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        data: { companyId: company.id },
        filter: { id: { in: personIds } },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    await waitForAllJobsToFinish();

    const [{ count }] = await global.testDataSource.query(
      `SELECT COUNT(*) FROM ${PERSON_TABLE} WHERE "id" = ANY($1) AND CARDINALITY("_accessGroupIds") > 0`,
      [personIds],
    );

    expect(Number(count)).toBe(personIds.length);

    await global.testDataSource.query(
      `DELETE FROM ${PERSON_TABLE} WHERE "id" = ANY($1)`,
      [personIds],
    );
  });
});
