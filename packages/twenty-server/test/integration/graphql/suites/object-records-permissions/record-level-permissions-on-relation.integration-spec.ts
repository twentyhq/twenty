import { randomUUID } from 'node:crypto';

import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  FieldMetadataType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const REGION_OBJECT_SINGULAR = 'rlsRegion';
const REGION_OBJECT_PLURAL = 'rlsRegions';
const REGION_FIELD_NAME = 'rlsRegion';
const COMPANY_FIELD_NAME = 'rlsCompany';

const MEMBER_REGION_ID = randomUUID();
const OTHER_REGION_ID = randomUUID();

const MEMBER_REGION_COMPANY_ID = randomUUID();
const OTHER_REGION_COMPANY_ID = randomUUID();
const CREATED_IN_MEMBER_REGION_COMPANY_ID = randomUUID();
const CREATED_IN_OTHER_REGION_COMPANY_ID = randomUUID();

const PREDICATE_ID = randomUUID();

const ALL_COMPANY_IDS = [
  MEMBER_REGION_COMPANY_ID,
  OTHER_REGION_COMPANY_ID,
  CREATED_IN_MEMBER_REGION_COMPANY_ID,
  CREATED_IN_OTHER_REGION_COMPANY_ID,
];

const findSeededCompanyIdsAsRestrictedMember = async (): Promise<string[]> => {
  const response = await makeGraphqlAPIRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: 'id',
      filter: {
        id: { in: [MEMBER_REGION_COMPANY_ID, OTHER_REGION_COMPANY_ID] },
      },
    }),
    APPLE_JONY_MEMBER_ACCESS_TOKEN,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.companies.edges.map(
    (edge: { node: { id: string } }) => edge.node.id,
  );
};

const createCompanyInRegionAsRestrictedMember = (
  companyId: string,
  regionId: string,
) =>
  makeGraphqlAPIRequest(
    createOneOperationFactory({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      data: {
        id: companyId,
        name: `RLS Relation Company ${companyId}`,
        [`${REGION_FIELD_NAME}Id`]: regionId,
      },
    }),
    APPLE_JONY_MEMBER_ACCESS_TOKEN,
  );

describe('row-level permission predicates comparing two relation fields', () => {
  let customRoleId: string;
  let originalMemberRoleId: string;
  let regionObjectMetadataId: string;
  let companyRegionFieldMetadataId: string;
  let workspaceMemberRegionFieldMetadataId: string;
  let workspaceMemberCompanyFieldMetadataId: string;
  let companyObjectMetadataId: string;

  beforeAll(async () => {
    const { data: regionObjectData } = await createOneObjectMetadata({
      input: {
        nameSingular: REGION_OBJECT_SINGULAR,
        namePlural: REGION_OBJECT_PLURAL,
        labelSingular: 'RLS Region',
        labelPlural: 'RLS Regions',
        icon: 'IconMap',
        isLabelSyncedWithName: false,
      },
    });

    regionObjectMetadataId = regionObjectData.createOneObject.id;

    await createOneFieldMetadata({
      input: {
        name: 'name',
        label: 'Name',
        type: FieldMetadataType.TEXT,
        objectMetadataId: regionObjectMetadataId,
        isLabelSyncedWithName: false,
      },
    });

    const objectMetadataRepository =
      getCoreRepository<ObjectMetadataEntity>(ObjectMetadataEntity);

    const companyObjectMetadata = await objectMetadataRepository.findOneOrFail({
      where: { workspaceId: SEED_APPLE_WORKSPACE_ID, nameSingular: 'company' },
    });

    companyObjectMetadataId = companyObjectMetadata.id;

    const workspaceMemberObjectMetadata =
      await objectMetadataRepository.findOneOrFail({
        where: {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          nameSingular: 'workspaceMember',
        },
      });

    const { data: companyRegionFieldData } = await createOneFieldMetadata({
      input: {
        name: REGION_FIELD_NAME,
        label: 'RLS Region',
        type: FieldMetadataType.RELATION,
        objectMetadataId: companyObjectMetadataId,
        isLabelSyncedWithName: false,
        relationCreationPayload: {
          targetObjectMetadataId: regionObjectMetadataId,
          targetFieldLabel: 'Companies',
          targetFieldIcon: 'IconBuildingSkyscraper',
          type: RelationType.MANY_TO_ONE,
        },
      },
    });

    companyRegionFieldMetadataId = companyRegionFieldData.createOneField.id;

    const { data: workspaceMemberRegionFieldData } =
      await createOneFieldMetadata({
        input: {
          name: REGION_FIELD_NAME,
          label: 'RLS Region',
          type: FieldMetadataType.RELATION,
          objectMetadataId: workspaceMemberObjectMetadata.id,
          isLabelSyncedWithName: false,
          relationCreationPayload: {
            targetObjectMetadataId: regionObjectMetadataId,
            targetFieldLabel: 'Workspace Members',
            targetFieldIcon: 'IconUser',
            type: RelationType.MANY_TO_ONE,
          },
        },
      });

    workspaceMemberRegionFieldMetadataId =
      workspaceMemberRegionFieldData.createOneField.id;

    const { data: workspaceMemberCompanyFieldData } =
      await createOneFieldMetadata({
        input: {
          name: COMPANY_FIELD_NAME,
          label: 'RLS Company',
          type: FieldMetadataType.RELATION,
          objectMetadataId: workspaceMemberObjectMetadata.id,
          isLabelSyncedWithName: false,
          relationCreationPayload: {
            targetObjectMetadataId: companyObjectMetadataId,
            targetFieldLabel: 'RLS Workspace Members',
            targetFieldIcon: 'IconUser',
            type: RelationType.MANY_TO_ONE,
          },
        },
      });

    workspaceMemberCompanyFieldMetadataId =
      workspaceMemberCompanyFieldData.createOneField.id;

    for (const [regionId, name] of [
      [MEMBER_REGION_ID, 'Member Region'],
      [OTHER_REGION_ID, 'Other Region'],
    ]) {
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: REGION_OBJECT_SINGULAR,
          gqlFields: 'id',
          data: { id: regionId, name },
        }),
      );
    }

    for (const [companyId, regionId] of [
      [MEMBER_REGION_COMPANY_ID, MEMBER_REGION_ID],
      [OTHER_REGION_COMPANY_ID, OTHER_REGION_ID],
    ]) {
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: COMPANY_GQL_FIELDS,
          data: {
            id: companyId,
            name: `RLS Relation Company ${companyId}`,
            [`${REGION_FIELD_NAME}Id`]: regionId,
          },
        }),
      );
    }

    await makeGraphqlAPIRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'workspaceMember',
        gqlFields: 'id',
        recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        data: { [`${REGION_FIELD_NAME}Id`]: MEMBER_REGION_ID },
      }),
    );

    const memberRole = await findOneRoleByLabel({ label: 'Member' });

    originalMemberRoleId = memberRole.id;

    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'RLS Relation Predicate Test Role',
        description: 'Role comparing a company relation to a member relation',
        icon: 'IconSettings',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
      },
    });

    const roleId = roleData?.createOneRole?.id;

    jestExpectToBeDefined(roleId);

    customRoleId = roleId;

    await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId: customRoleId,
        objectMetadataId: companyObjectMetadataId,
        predicates: [
          {
            id: PREDICATE_ID,
            fieldMetadataId: companyRegionFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.IS,
            workspaceMemberFieldMetadataId:
              workspaceMemberRegionFieldMetadataId,
          },
        ],
        predicateGroups: [],
      },
    });

    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        roleId: customRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    });
  });

  afterAll(async () => {
    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        roleId: originalMemberRoleId,
      },
    });

    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: customRoleId },
    });

    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        filter: { id: { in: ALL_COMPANY_IDS } },
      }),
    );

    await makeGraphqlAPIRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'workspaceMember',
        gqlFields: 'id',
        recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        data: { [`${REGION_FIELD_NAME}Id`]: null },
      }),
    );

    for (const fieldMetadataId of [
      companyRegionFieldMetadataId,
      workspaceMemberRegionFieldMetadataId,
      workspaceMemberCompanyFieldMetadataId,
    ]) {
      await deleteOneFieldMetadata({
        expectToFail: false,
        input: { idToDelete: fieldMetadataId },
      });
    }

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: regionObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });

    await deleteOneObjectMetadata({
      input: { idToDelete: regionObjectMetadataId },
    });
  });

  it('returns only the records sharing the current member relation', async () => {
    expect(await findSeededCompanyIdsAsRestrictedMember()).toEqual([
      MEMBER_REGION_COMPANY_ID,
    ]);
  });

  it('allows creating a record in the current member region', async () => {
    const response = await createCompanyInRegionAsRestrictedMember(
      CREATED_IN_MEMBER_REGION_COMPANY_ID,
      MEMBER_REGION_ID,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createCompany.id).toBe(
      CREATED_IN_MEMBER_REGION_COMPANY_ID,
    );
  });

  it('rejects creating a record in another region', async () => {
    const response = await createCompanyInRegionAsRestrictedMember(
      CREATED_IN_OTHER_REGION_COMPANY_ID,
      OTHER_REGION_ID,
    );

    expect(response.body.errors).toBeDefined();
  });

  it('rejects a predicate whose relations point to different objects', async () => {
    await upsertRowLevelPermissionPredicates({
      expectToFail: true,
      input: {
        roleId: customRoleId,
        objectMetadataId: companyObjectMetadataId,
        predicates: [
          {
            id: PREDICATE_ID,
            fieldMetadataId: companyRegionFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.IS,
            workspaceMemberFieldMetadataId:
              workspaceMemberCompanyFieldMetadataId,
          },
        ],
        predicateGroups: [],
      },
    });
  });

  it('rejects a relation predicate with an operand the query filter cannot express', async () => {
    await upsertRowLevelPermissionPredicates({
      expectToFail: true,
      input: {
        roleId: customRoleId,
        objectMetadataId: companyObjectMetadataId,
        predicates: [
          {
            id: PREDICATE_ID,
            fieldMetadataId: companyRegionFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            workspaceMemberFieldMetadataId:
              workspaceMemberRegionFieldMetadataId,
          },
        ],
        predicateGroups: [],
      },
    });
  });
});
