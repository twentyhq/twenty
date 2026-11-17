import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { revokeObjectRecordsPermissions } from 'test/integration/metadata/suites/object-permission/utils/revoke-object-records-permissions.util';
import { upsertRowLevelPermissionRules } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-rules.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';

import { type RowLevelPermissionRuleInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-rules.input';

export type RowLevelPermissionRuleGrants = Pick<
  RowLevelPermissionRuleInput,
  | 'canCreateRecords'
  | 'canReadRecords'
  | 'canUpdateRecords'
  | 'canSoftDeleteRecords'
  | 'canDestroyRecords'
>;

export const upsertContainsRlsPredicate = async ({
  roleId,
  objectNameSingular,
  fieldName,
  value,
  ruleGrants,
}: {
  roleId: string;
  objectNameSingular: string;
  fieldName: string;
  value: string;
  ruleGrants: RowLevelPermissionRuleGrants;
}): Promise<void> => {
  const { objects } = await findManyObjectMetadata({
    expectToFail: false,
    input: { filter: {}, paging: { first: 1000 } },
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

  const objectMetadata = objects.find(
    (object) => object.nameSingular === objectNameSingular,
  );

  jestExpectToBeDefined(objectMetadata);

  const fieldMetadata = objectMetadata.fieldsList?.find(
    (field) => field.name === fieldName,
  );

  jestExpectToBeDefined(fieldMetadata);

  await revokeObjectRecordsPermissions({
    roleId,
    objectMetadataId: objectMetadata.id,
  });

  await upsertRowLevelPermissionRules({
    expectToFail: false,
    input: {
      roleId,
      objectMetadataId: objectMetadata.id,
      rules: [
        {
          ...ruleGrants,
          predicates: [
            {
              fieldMetadataId: fieldMetadata.id,
              operand: RowLevelPermissionPredicateOperand.CONTAINS,
              value,
            },
          ],
        },
      ],
    },
  });
};
