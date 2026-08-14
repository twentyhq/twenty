import { upsertFieldPermissions } from 'test/integration/metadata/suites/field-permission/utils/upsert-field-permissions.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findRoles } from 'test/integration/metadata/suites/role/utils/find-roles.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

const ROLE_GQL_FIELDS_WITH_FIELD_PERMISSIONS = `
  id
  label
  fieldPermissions {
    objectMetadataId
    fieldMetadataId
    canReadFieldValue
    canUpdateFieldValue
  }
`;

describe('Relation field permission grant-back', () => {
  let createdRoleId: string;
  let sourceObjectMetadataId: string;
  let targetObjectMetadataId: string;
  let relationFieldMetadataId: string;
  let inverseRelationFieldMetadataId: string;

  const findFieldPermissionsForRole = async () => {
    const { data } = await findRoles({
      expectToFail: false,
      gqlFields: ROLE_GQL_FIELDS_WITH_FIELD_PERMISSIONS,
    });

    const role = data?.getRoles?.find((r) => r.id === createdRoleId);

    jestExpectToBeDefined(role);

    return role.fieldPermissions ?? [];
  };

  beforeAll(async () => {
    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Test Role For Relation Field Permission Grant Back',
        description: 'Role for relation field permission mirror tests',
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

    createdRoleId = roleData?.createOneRole?.id;
    jestExpectToBeDefined(createdRoleId);

    const {
      data: { createOneObject: sourceObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'fpGrantBackSource',
        namePlural: 'fpGrantBackSources',
        labelSingular: 'Fp Grant Back Source',
        labelPlural: 'Fp Grant Back Sources',
        icon: 'IconSettings',
      },
    });

    sourceObjectMetadataId = sourceObject.id;
    jestExpectToBeDefined(sourceObjectMetadataId);

    const {
      data: { createOneObject: targetObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'fpGrantBackTarget',
        namePlural: 'fpGrantBackTargets',
        labelSingular: 'Fp Grant Back Target',
        labelPlural: 'Fp Grant Back Targets',
        icon: 'IconSettings',
      },
    });

    targetObjectMetadataId = targetObject.id;
    jestExpectToBeDefined(targetObjectMetadataId);

    const relationField = await createRelationBetweenObjects({
      objectMetadataId: sourceObjectMetadataId,
      targetObjectMetadataId,
      type: FieldMetadataType.RELATION,
      relationType: RelationType.MANY_TO_ONE,
      name: 'grantBackTarget',
      label: 'Grant Back Target',
      targetFieldLabel: 'Grant Back Sources',
    });

    relationFieldMetadataId = relationField.id;
    inverseRelationFieldMetadataId =
      relationField.relation.targetFieldMetadata.id;
    jestExpectToBeDefined(relationFieldMetadataId);
    jestExpectToBeDefined(inverseRelationFieldMetadataId);
  });

  afterAll(async () => {
    if (isDefined(createdRoleId)) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: createdRoleId },
      });
    }

    for (const objectMetadataId of [
      sourceObjectMetadataId,
      targetObjectMetadataId,
    ]) {
      if (!isDefined(objectMetadataId)) {
        continue;
      }

      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: objectMetadataId,
          updatePayload: { isActive: false },
        },
      });
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: objectMetadataId },
      });
    }
  });

  it('should mirror an edit restriction on a relation field onto the inverse relation field', async () => {
    await upsertFieldPermissions({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        fieldPermissions: [
          {
            objectMetadataId: sourceObjectMetadataId,
            fieldMetadataId: relationFieldMetadataId,
            canUpdateFieldValue: false,
          },
        ],
      },
    });

    const fieldPermissions = await findFieldPermissionsForRole();

    expect(fieldPermissions).toHaveLength(2);
    expect(fieldPermissions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          objectMetadataId: sourceObjectMetadataId,
          fieldMetadataId: relationFieldMetadataId,
          canUpdateFieldValue: false,
        }),
        expect.objectContaining({
          objectMetadataId: targetObjectMetadataId,
          fieldMetadataId: inverseRelationFieldMetadataId,
          canUpdateFieldValue: false,
        }),
      ]),
    );
  });

  it('should delete the mirrored inverse field permission when the relation field is granted back', async () => {
    const grantBackRelationField = () =>
      upsertFieldPermissions({
        expectToFail: false,
        input: {
          roleId: createdRoleId,
          fieldPermissions: [
            {
              objectMetadataId: sourceObjectMetadataId,
              fieldMetadataId: relationFieldMetadataId,
              canReadFieldValue: null,
              canUpdateFieldValue: null,
            },
          ],
        },
      });

    await grantBackRelationField();

    expect(await findFieldPermissionsForRole()).toHaveLength(0);

    // Granting back a field that has no rows left must not create empty ones
    await grantBackRelationField();

    expect(await findFieldPermissionsForRole()).toHaveLength(0);
  });
});
