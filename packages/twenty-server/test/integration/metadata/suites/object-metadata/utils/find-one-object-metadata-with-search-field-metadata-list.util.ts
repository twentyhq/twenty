import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';

import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { type SearchFieldMetadataDTO } from 'src/engine/metadata-modules/search-field-metadata/dtos/search-field-metadata.dto';

export const findOneObjectMetadataWithSearchFieldMetadataList = async ({
  objectMetadataId,
}: {
  objectMetadataId: string;
}) => {
  const { objects } = await findManyObjectMetadata({
    expectToFail: false,
    input: {
      filter: { id: { eq: objectMetadataId } },
      paging: { first: 1 },
    },
    gqlFields: `
      id
      labelIdentifierFieldMetadataId
      searchFieldMetadataList {
        id
        fieldMetadataId
        position
      }
    `,
  });

  return objects[0] as ObjectMetadataDTO & {
    searchFieldMetadataList: Pick<
      SearchFieldMetadataDTO,
      'id' | 'fieldMetadataId' | 'position'
    >[];
  };
};
