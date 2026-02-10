import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

export type TestFieldMetadataIds = {
  objectMetadataId: string;
  fieldMetadataId1: string;
  fieldMetadataId2: string;
  fieldMetadataId3: string;
  fieldMetadataId3SubFieldName: string;
};

// Uses well-known company fields that make semantic sense for chart configs:
// - employees (number field, suitable for aggregation)
// - name (text field, suitable for grouping)
// - domainName (link field, suitable for secondary grouping)
export const fetchTestFieldMetadataIds =
  async (): Promise<TestFieldMetadataIds> => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 100 },
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

    const companyObject = objects.find(
      (object) => object.nameSingular === 'company',
    );

    jestExpectToBeDefined(companyObject);

    const fieldsList = companyObject.fieldsList;

    jestExpectToBeDefined(fieldsList);

    const findFieldByName = (fieldName: string) => {
      const field = fieldsList!.find(
        (fieldMetadata) => fieldMetadata.name === fieldName,
      );

      jestExpectToBeDefined(field);

      return field!;
    };

    return {
      objectMetadataId: companyObject.id,
      fieldMetadataId1: findFieldByName('employees').id,
      fieldMetadataId2: findFieldByName('name').id,
      fieldMetadataId3: findFieldByName('domainName').id,
      fieldMetadataId3SubFieldName: 'primaryLinkUrl',
    };
  };
