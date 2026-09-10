import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';

export const upsertContainsRlsPredicate = async ({
  roleId,
  objectNameSingular,
  fieldName,
  value,
}: {
  roleId: string;
  objectNameSingular: string;
  fieldName: string;
  value: string;
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

  await upsertRowLevelPermissionPredicates({
    expectToFail: false,
    input: {
      roleId,
      objectMetadataId: objectMetadata.id,
      predicates: [
        {
          fieldMetadataId: fieldMetadata.id,
          operand: RowLevelPermissionPredicateOperand.CONTAINS,
          value,
        },
      ],
      predicateGroups: [],
    },
  });
};
