import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  FieldMetadataType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

const ROLE_LABEL = 'Territory restricted role';

describe('Field deletion used by a row-level permission predicate', () => {
  let roleId: string;
  let companyObjectMetadataId: string;
  let territoryFieldMetadataId: string;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: `
        id
        nameSingular
      `,
    });

    jestExpectToBeDefined(objects);

    const companyObjectMetadata = objects.find(
      (object) => object.nameSingular === 'company',
    );

    jestExpectToBeDefined(companyObjectMetadata);
    companyObjectMetadataId = companyObjectMetadata.id;

    const { data: fieldData } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'rlsTerritory',
        label: 'RLS territory',
        type: FieldMetadataType.TEXT,
        objectMetadataId: companyObjectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: 'id',
    });

    territoryFieldMetadataId = fieldData.createOneField.id;

    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: ROLE_LABEL,
        description: 'Reads companies of its territory only',
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

    roleId = roleData?.createOneRole?.id;
    jestExpectToBeDefined(roleId);

    await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId: companyObjectMetadataId,
        predicates: [
          {
            fieldMetadataId: territoryFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value: 'EU',
          },
        ],
        predicateGroups: [],
      },
    });

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: territoryFieldMetadataId,
        updatePayload: { isActive: false },
      },
      gqlFields: 'id',
    });
  });

  afterAll(async () => {
    if (roleId) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: roleId },
      });
    }
  });

  it('refuses the deletion while a rule uses the field, then allows it once the rule is removed', async () => {
    const { errors } = await deleteOneFieldMetadata({
      expectToFail: true,
      input: { idToDelete: territoryFieldMetadataId },
    });

    expect(JSON.stringify(errors)).toContain(
      'is used by 1 row-level permission predicate',
    );

    await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId: companyObjectMetadataId,
        predicates: [],
        predicateGroups: [],
      },
    });

    await deleteOneFieldMetadata({
      expectToFail: false,
      input: { idToDelete: territoryFieldMetadataId },
    });
  });
});
