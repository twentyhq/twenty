import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { isDefined } from 'twenty-shared/utils';

export const findFieldMetadataIdByName = async ({
  objectNameSingular,
  fieldName,
}: {
  objectNameSingular: string;
  fieldName: string;
}): Promise<string> => {
  const { fields } = await findManyFieldsMetadata({
    input: { filter: {}, paging: { first: 1000 } },
    gqlFields: `
      id
      name
      object {
        nameSingular
      }
    `,
    expectToFail: false,
  });

  const fieldMetadataId = fields?.find(
    ({ node }: { node: { name: string; object: { nameSingular: string } } }) =>
      node.name === fieldName &&
      node.object.nameSingular === objectNameSingular,
  )?.node.id;

  if (!isDefined(fieldMetadataId)) {
    throw new Error(
      `The ${objectNameSingular}.${fieldName} field metadata is missing from the seed`,
    );
  }

  return fieldMetadataId;
};
