import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import {
  cleanupRolesPermissionHolder,
  type RolesPermissionHolderSetup,
  setupRolesPermissionHolder,
} from 'test/integration/metadata/suites/row-level-permission-predicate/utils/setup-roles-permission-holder.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type UpsertRowLevelPermissionPredicatesInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-predicates.input';

const RESTRICTED_ROLE_LABEL = 'Test Role For RLS Upsert By Roles Holder';
const PREDICATE_ID = v4();
const PREDICATE_GROUP_ID = v4();

describe('Row Level Permission Predicate upsert by a non-Admin member with the roles permission should succeed', () => {
  let restrictedRoleId: string;
  let companyObjectMetadataId: string;
  let companyNameFieldMetadataId: string;
  let rolesPermissionHolder: RolesPermissionHolderSetup;

  const buildInputWithPredicateValue = (
    value: string,
  ): UpsertRowLevelPermissionPredicatesInput => ({
    roleId: restrictedRoleId,
    objectMetadataId: companyObjectMetadataId,
    predicates: [
      {
        id: PREDICATE_ID,
        fieldMetadataId: companyNameFieldMetadataId,
        operand: RowLevelPermissionPredicateOperand.CONTAINS,
        value,
        rowLevelPermissionPredicateGroupId: PREDICATE_GROUP_ID,
        positionInRowLevelPermissionPredicateGroup: 0,
      },
    ],
    predicateGroups: [
      {
        id: PREDICATE_GROUP_ID,
        objectMetadataId: companyObjectMetadataId,
        logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
      },
    ],
  });

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 1000 },
      },
      gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          name
        }
      `,
    });

    jestExpectToBeDefined(objects);

    const companyObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'company',
    );

    jestExpectToBeDefined(companyObjectMetadata);
    companyObjectMetadataId = companyObjectMetadata.id;

    jestExpectToBeDefined(companyObjectMetadata.fieldsList);
    const nameField = companyObjectMetadata.fieldsList.find(
      (field: { name: string }) => field.name === 'name',
    );

    jestExpectToBeDefined(nameField);
    companyNameFieldMetadataId = nameField.id;

    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: RESTRICTED_ROLE_LABEL,
        description: 'A role whose RLS predicates a non-Admin member edits',
        icon: 'IconSettings',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
      },
    });

    restrictedRoleId = roleData?.createOneRole?.id;
    jestExpectToBeDefined(restrictedRoleId);

    rolesPermissionHolder = await setupRolesPermissionHolder({
      label: 'Test Roles Permission Holder For RLS Upsert',
    });
  });

  afterAll(async () => {
    await cleanupRolesPermissionHolder(rolesPermissionHolder);

    if (isDefined(restrictedRoleId)) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: restrictedRoleId },
      });
    }
  });

  it('should create a predicate in a group', async () => {
    const { data } = await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      input: buildInputWithPredicateValue('Apple'),
    });

    expect(data.upsertRowLevelPermissionPredicates.predicates).toMatchObject([
      {
        id: PREDICATE_ID,
        fieldMetadataId: companyNameFieldMetadataId,
        operand: RowLevelPermissionPredicateOperand.CONTAINS,
        value: 'Apple',
        roleId: restrictedRoleId,
        rowLevelPermissionPredicateGroupId: PREDICATE_GROUP_ID,
      },
    ]);
    expect(
      data.upsertRowLevelPermissionPredicates.predicateGroups,
    ).toMatchObject([
      {
        id: PREDICATE_GROUP_ID,
        logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
        roleId: restrictedRoleId,
      },
    ]);
  });

  it('should edit the predicate value', async () => {
    const { data } = await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      input: buildInputWithPredicateValue('Microsoft'),
    });

    expect(data.upsertRowLevelPermissionPredicates.predicates).toMatchObject([
      {
        id: PREDICATE_ID,
        value: 'Microsoft',
        rowLevelPermissionPredicateGroupId: PREDICATE_GROUP_ID,
      },
    ]);
    expect(
      data.upsertRowLevelPermissionPredicates.predicateGroups,
    ).toMatchObject([{ id: PREDICATE_GROUP_ID }]);
  });

  it('should delete the predicate and the group', async () => {
    const { data } = await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      input: {
        roleId: restrictedRoleId,
        objectMetadataId: companyObjectMetadataId,
        predicates: [],
        predicateGroups: [],
      },
    });

    expect(data.upsertRowLevelPermissionPredicates).toEqual({
      predicates: [],
      predicateGroups: [],
    });

    const restrictedRole = await findOneRoleByLabel({
      label: RESTRICTED_ROLE_LABEL,
      gqlFields: `
        id
        label
        rowLevelPermissionPredicates {
          id
        }
        rowLevelPermissionPredicateGroups {
          id
        }
      `,
    });

    expect(restrictedRole.rowLevelPermissionPredicates).toEqual([]);
    expect(restrictedRole.rowLevelPermissionPredicateGroups).toEqual([]);
  });
});
