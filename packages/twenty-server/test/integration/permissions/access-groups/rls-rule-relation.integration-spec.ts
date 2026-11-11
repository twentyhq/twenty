import { type DocumentNode } from 'graphql';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { revokeObjectRecordsPermissions } from 'test/integration/metadata/suites/object-permission/utils/revoke-object-records-permissions.util';
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

import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const SCHEMA = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"`;
const PERSON_TABLE = `${SCHEMA}."person"`;
const COMPANY_TABLE = `${SCHEMA}."company"`;
const RULE_VALUE = 'Relation match';

describe('RLS rules through a relation (integration)', () => {
  let originalMemberRoleId: string;
  let roleIds: string[] = [];
  let personObjectMetadataId: string;
  let companyObjectMetadataId: string;
  let person: { id: string; jobTitle: string; companyId: string };
  let company: { id: string; name: string; employees: number | null };
  let otherCompany: { id: string };
  let temporaryPersonIds: string[] = [];

  const findMetadataId = async ({
    table,
    where,
    values,
  }: {
    table: string;
    where: string;
    values: string[];
  }): Promise<string> => {
    const [{ id }] = await global.testDataSource.query(
      `SELECT "id" FROM core."${table}" WHERE ${where}`,
      values,
    );

    return id;
  };

  const findFieldMetadataId = (objectMetadataId: string, name: string) =>
    findMetadataId({
      table: 'fieldMetadata',
      where: `"objectMetadataId" = $1 AND "name" = $2`,
      values: [objectMetadataId, name],
    });

  const findObjectMetadataId = (nameSingular: string) =>
    findMetadataId({
      table: 'objectMetadata',
      where: `"workspaceId" = $1 AND "nameSingular" = $2`,
      values: [SEED_APPLE_WORKSPACE_ID, nameSingular],
    });

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
    const ruleId = v4();

    roleIds.push(roleId);

    await global.testDataSource.query(
      `UPDATE core."role" SET "canCreateAllObjectRecords" = TRUE WHERE "id" = $1`,
      [roleId],
    );
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['rolesPermissions']);
    await revokeObjectRecordsPermissions({ roleId, objectMetadataId });
    await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId,
        canCreateRecords: true,
        canReadRecords: true,
        canUpdateRecords: true,
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
    await getAppProviderByClassName<AccessGroupSyncService>(
      'AccessGroupSyncService',
    ).syncAccessGroups(SEED_APPLE_WORKSPACE_ID);
    await getAppProviderByClassName<RecordAccessGroupComputationService>(
      'RecordAccessGroupComputationService',
    ).recomputeRecordAccessGroupIdsOfAllObjectRecords({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadataId,
    });
  };

  const assignPersonRuleThroughCompanyName = async () => {
    await global.testDataSource.query(
      `UPDATE ${COMPANY_TABLE} SET "name" = '${RULE_VALUE}' WHERE "id" = $1`,
      [company.id],
    );
    await assignRuleThroughRelation({
      objectMetadataId: personObjectMetadataId,
      relationFieldMetadataId: await findFieldMetadataId(
        personObjectMetadataId,
        'company',
      ),
      fieldMetadataId: await findFieldMetadataId(
        companyObjectMetadataId,
        'name',
      ),
      value: RULE_VALUE,
    });
  };

  const assignCompanyRuleThroughPeopleJobTitle = async () => {
    await global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "jobTitle" = '${RULE_VALUE}' WHERE "id" = $1`,
      [person.id],
    );
    await assignRuleThroughRelation({
      objectMetadataId: companyObjectMetadataId,
      relationFieldMetadataId: await findFieldMetadataId(
        companyObjectMetadataId,
        'people',
      ),
      fieldMetadataId: await findFieldMetadataId(
        personObjectMetadataId,
        'jobTitle',
      ),
      value: RULE_VALUE,
    });
  };

  const insertPeople = async ({
    personIds,
    companyId,
  }: {
    personIds: string[];
    companyId: string;
  }) => {
    temporaryPersonIds.push(...personIds);

    await global.testDataSource.query(
      `INSERT INTO ${PERSON_TABLE} ("id", "companyId") SELECT UNNEST($1::uuid[]), $2`,
      [personIds, companyId],
    );
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

  const findPeopleAsMember = (ids: string[]) =>
    findIdsAsMember({ singular: 'person', plural: 'people', ids });

  const findCompaniesAsMember = () =>
    findIdsAsMember({
      singular: 'company',
      plural: 'companies',
      ids: [company.id, otherCompany.id],
    });

  const runAsAdminAndWaitForJobs = async (operation: {
    query: DocumentNode;
    variables: Record<string, unknown>;
  }) => {
    const response = await makeGraphqlApiRequest(operation);

    expect(response.body.errors).toBeUndefined();
    await waitForAllJobsToFinish();
  };

  const updateCompanyAsAdmin = (data: Record<string, unknown>) =>
    runAsAdminAndWaitForJobs(
      updateOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        recordId: company.id,
        data,
      }),
    );

  const setFeatureFlags = async (value: boolean) => {
    for (const featureFlag of [
      FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
      FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
    ]) {
      await updateFeatureFlag({ featureFlag, value, expectToFail: false });
    }
  };

  beforeAll(async () => {
    personObjectMetadataId = await findObjectMetadataId('person');
    companyObjectMetadataId = await findObjectMetadataId('company');

    company = { id: v4(), name: 'Relation original', employees: null };
    otherCompany = { id: v4() };
    person = { id: v4(), jobTitle: 'Original', companyId: company.id };

    await global.testDataSource.query(
      `INSERT INTO ${COMPANY_TABLE} ("id", "name") VALUES ($1, $2), ($3, 'Relation other')`,
      [company.id, company.name, otherCompany.id],
    );
    await global.testDataSource.query(
      `INSERT INTO ${PERSON_TABLE} ("id", "jobTitle", "companyId") VALUES ($1, $2, $3)`,
      [person.id, person.jobTitle, person.companyId],
    );

    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    await setFeatureFlags(true);
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
      `DELETE FROM ${PERSON_TABLE} WHERE "id" = ANY($1)`,
      [temporaryPersonIds],
    );

    temporaryPersonIds = [];

    await global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "jobTitle" = $1, "companyId" = $2 WHERE "id" = $3`,
      [person.jobTitle, person.companyId, person.id],
    );
    await global.testDataSource.query(
      `UPDATE ${COMPANY_TABLE} SET "name" = $1, "employees" = $2 WHERE "id" = $3`,
      [company.name, company.employees, company.id],
    );
  });

  afterAll(async () => {
    await setFeatureFlags(false);
    await global.testDataSource.query(
      `DELETE FROM ${PERSON_TABLE} WHERE "id" = $1`,
      [person.id],
    );
    await global.testDataSource.query(
      `DELETE FROM ${COMPANY_TABLE} WHERE "id" = ANY($1)`,
      [[company.id, otherCompany.id]],
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
    await assignPersonRuleThroughCompanyName();

    expect(await findPeopleAsMember([person.id])).toEqual([person.id]);

    await updateCompanyAsAdmin({ name: 'No longer matching' });

    expect(await findPeopleAsMember([person.id])).toEqual([]);
  });

  it('should check creates and updates through the relation', async () => {
    await assignPersonRuleThroughCompanyName();

    const createPerson = (companyId: string) => {
      const id = v4();

      temporaryPersonIds.push(id);

      return makeGraphqlApiRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          data: { id, companyId },
        }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
    };

    expect((await createPerson(company.id)).body.errors).toBeUndefined();
    expect((await createPerson(otherCompany.id)).body.errors).toBeDefined();

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
  });

  it('should follow a one to many relation and a related record moving away', async () => {
    await assignCompanyRuleThroughPeopleJobTitle();

    expect(await findCompaniesAsMember()).toEqual([company.id]);

    await runAsAdminAndWaitForJobs(
      updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        recordId: person.id,
        data: { companyId: otherCompany.id },
      }),
    );

    expect(await findCompaniesAsMember()).toEqual([otherCompany.id]);
  });

  it('should update the related record a system write moves away from', async () => {
    await assignCompanyRuleThroughPeopleJobTitle();

    const workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    await workspaceOrmManager.executeInWorkspaceContext(async () => {
      await workspaceOrmManager
        .getRepositoryWithoutPermissionChecks('person', {
          shouldSkipEventEmission: true,
        })
        .update(person.id, { companyId: otherCompany.id });
    }, buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID));
    await waitForAllJobsToFinish();

    expect(await findCompaniesAsMember()).toEqual([otherCompany.id]);
  });

  it('should update related records when their related record is destroyed', async () => {
    const companyToDestroyId = v4();
    const personId = v4();

    await global.testDataSource.query(
      `INSERT INTO ${COMPANY_TABLE} ("id", "name") VALUES ($1, '${RULE_VALUE}')`,
      [companyToDestroyId],
    );
    await insertPeople({
      personIds: [personId],
      companyId: companyToDestroyId,
    });
    await assignPersonRuleThroughCompanyName();

    expect(await findPeopleAsMember([personId])).toEqual([personId]);

    await runAsAdminAndWaitForJobs(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        recordId: companyToDestroyId,
      }),
    );

    expect(await findPeopleAsMember([personId])).toEqual([]);
  });

  it('should only update related records when a compared field is written', async () => {
    const findPersonAccessGroupIds = async (): Promise<number[] | null> => {
      const [{ _accessGroupIds }] = await global.testDataSource.query(
        `SELECT "_accessGroupIds" FROM ${PERSON_TABLE} WHERE "id" = $1`,
        [person.id],
      );

      return _accessGroupIds;
    };

    await assignPersonRuleThroughCompanyName();
    await global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "_accessGroupIds" = NULL WHERE "id" = $1`,
      [person.id],
    );

    await updateCompanyAsAdmin({ employees: (company.employees ?? 0) + 1 });

    expect(await findPersonAccessGroupIds()).toBeNull();

    await updateCompanyAsAdmin({ name: `${RULE_VALUE} again` });

    expect(await findPersonAccessGroupIds()).not.toBeNull();
  });

  it('should recompute through a job when a write covers many records', async () => {
    const personIds = Array.from({ length: 101 }, () => v4());

    await insertPeople({ personIds, companyId: otherCompany.id });
    await assignPersonRuleThroughCompanyName();

    await runAsAdminAndWaitForJobs(
      updateManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        data: { companyId: company.id },
        filter: { id: { in: personIds } },
      }),
    );

    const [{ count }] = await global.testDataSource.query(
      `SELECT COUNT(*) FROM ${PERSON_TABLE} WHERE "id" = ANY($1) AND CARDINALITY("_accessGroupIds") > 0`,
      [personIds],
    );

    expect(Number(count)).toBe(personIds.length);
  });

  it('should stop and resume access when the relation flag is toggled', async () => {
    const setRelationFlag = async (value: boolean) => {
      await updateFeatureFlag({
        featureFlag:
          FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
        value,
        expectToFail: false,
      });
    };

    await assignPersonRuleThroughCompanyName();

    expect(await findPeopleAsMember([person.id])).toEqual([person.id]);

    await setRelationFlag(false);

    expect(await findPeopleAsMember([person.id])).toEqual([]);

    await waitForAllJobsToFinish();
    await setRelationFlag(true);
    await waitForAllJobsToFinish();

    expect(await findPeopleAsMember([person.id])).toEqual([person.id]);
  });
});
