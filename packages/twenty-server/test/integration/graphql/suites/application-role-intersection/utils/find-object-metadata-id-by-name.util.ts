import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { isDefined } from 'twenty-shared/utils';

export const findObjectMetadataIdByName = async (
  nameSingular: string,
): Promise<string> => {
  const { objects } = await findManyObjectMetadata({
    input: { filter: {}, paging: { first: 100 } },
    gqlFields: `
      id
      nameSingular
    `,
    expectToFail: false,
  });

  const objectMetadataId = objects.find(
    (objectMetadata) => objectMetadata.nameSingular === nameSingular,
  )?.id;

  if (!isDefined(objectMetadataId)) {
    throw new Error(`The ${nameSingular} object metadata is missing from the seed`);
  }

  return objectMetadataId;
};
