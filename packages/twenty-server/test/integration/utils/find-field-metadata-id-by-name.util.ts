import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { isDefined } from 'twenty-shared/utils';

export const findFieldMetadataIdByName = async ({
  objectMetadataId,
  fieldName,
}: {
  objectMetadataId: string;
  fieldName: string;
}): Promise<string> => {
  const { fields } = await findManyFieldsMetadata({
    input: {
      filter: { objectMetadataId: { eq: objectMetadataId } },
      paging: { first: 1000 },
    },
    gqlFields: `
      id
      name
    `,
    expectToFail: false,
  });

  const fieldMetadataId = fields?.find(
    ({ node }: { node: { name: string } }) => node.name === fieldName,
  )?.node.id;

  if (!isDefined(fieldMetadataId)) {
    throw new Error(`The ${fieldName} field metadata is missing from the seed`);
  }

  return fieldMetadataId;
};
