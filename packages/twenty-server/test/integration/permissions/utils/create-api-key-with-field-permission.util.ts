import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { upsertFieldPermissions } from 'test/integration/metadata/suites/field-permission/utils/upsert-field-permissions.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import {
  type ApiKeyWithObjectRecordGrants,
  createApiKeyWithObjectRecordGrants,
} from 'test/integration/permissions/utils/create-api-key-with-object-record-grants.util';
import { findFieldMetadataIdByName } from 'test/integration/utils/find-field-metadata-id-by-name.util';

import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';

export const createApiKeyWithFieldPermission = async ({
  objectNameSingular,
  fieldName,
  canReadFieldValue = null,
  canUpdateFieldValue = null,
  isFieldInRowLevelPredicate = false,
}: {
  objectNameSingular: string;
  fieldName: string;
  canReadFieldValue?: false | null;
  canUpdateFieldValue?: false | null;
  isFieldInRowLevelPredicate?: boolean;
}): Promise<ApiKeyWithObjectRecordGrants> => {
  const objectMetadataId = await findObjectMetadataIdByName(objectNameSingular);

  const [apiKey, fieldMetadataId] = await Promise.all([
    createApiKeyWithObjectRecordGrants({
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
    }),
    findFieldMetadataIdByName({ objectMetadataId, fieldName }),
  ]);

  await upsertFieldPermissions({
    input: {
      roleId: apiKey.roleId,
      fieldPermissions: [
        {
          objectMetadataId,
          fieldMetadataId,
          canReadFieldValue,
          canUpdateFieldValue,
        },
      ],
    },
    expectToFail: false,
  });

  if (isFieldInRowLevelPredicate) {
    await upsertRowLevelPermissionPredicates({
      input: {
        roleId: apiKey.roleId,
        objectMetadataId,
        predicates: [
          {
            fieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.IS_NOT_EMPTY,
          },
        ],
        predicateGroups: [],
      },
      expectToFail: false,
    });
  }

  return apiKey;
};
