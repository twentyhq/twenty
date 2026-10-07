import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

export type DashboardFilterTestFieldMetadataIds = {
  companyObjectMetadataId: string;
  companyPositionFieldMetadataId: string;
  companyNameFieldMetadataId: string;
  companyCreatedAtFieldMetadataId: string;
  companyAccountOwnerFieldMetadataId: string;
  personCreatedAtFieldMetadataId: string;
};

// Company charts bind the built-in Date and Owner slots to createdAt and
// accountOwner; person.createdAt is the "field of another object" case
export const fetchDashboardFilterTestFieldMetadataIds =
  async (): Promise<DashboardFilterTestFieldMetadataIds> => {
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

    const findFieldIdByName = (
      objectNameSingular: string,
      fieldName: string,
    ) => {
      const object = objects.find(
        (objectMetadata) => objectMetadata.nameSingular === objectNameSingular,
      );

      jestExpectToBeDefined(object);

      const field = object.fieldsList?.find(
        (fieldMetadata) => fieldMetadata.name === fieldName,
      );

      jestExpectToBeDefined(field);

      return { objectMetadataId: object.id, fieldMetadataId: field.id };
    };

    return {
      companyObjectMetadataId: findFieldIdByName('company', 'name')
        .objectMetadataId,
      companyPositionFieldMetadataId: findFieldIdByName('company', 'position')
        .fieldMetadataId,
      companyNameFieldMetadataId: findFieldIdByName('company', 'name')
        .fieldMetadataId,
      companyCreatedAtFieldMetadataId: findFieldIdByName('company', 'createdAt')
        .fieldMetadataId,
      companyAccountOwnerFieldMetadataId: findFieldIdByName(
        'company',
        'accountOwner',
      ).fieldMetadataId,
      personCreatedAtFieldMetadataId: findFieldIdByName('person', 'createdAt')
        .fieldMetadataId,
    };
  };
