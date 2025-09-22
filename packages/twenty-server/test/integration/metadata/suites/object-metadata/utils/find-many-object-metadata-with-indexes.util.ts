import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import { type IndexFieldMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-field-metadata.dto';
import { type IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

export const findManyObjectMetadataWithIndexes = async ({
  expectToFail,
}: {
  expectToFail: boolean;
}) => {
  const { objects } = await findManyObjectMetadata({
    expectToFail,
    input: {
      filter: {},
      paging: {
        first: 100,
      },
    },
    gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          type
          name
          relation {
            type
            sourceObjectMetadata {
              id
              nameSingular
              namePlural
            }
            targetObjectMetadata {
              id
              nameSingular
              namePlural
            }
            sourceFieldMetadata {
              id
              name
            }
            targetFieldMetadata {
              id
              name
            }
          }
        }
        indexMetadataList {
          name
          isUnique
          isCustom
          indexType
          indexFieldMetadataList {
            id
            fieldMetadataId
            createdAt
            updatedAt
            order
          }
        }
      `,
  });

  return objects as Array<
    ObjectMetadataDTO & {
      fieldsList: (FieldMetadataDTO & { relation: RelationDTO | null })[];
      indexMetadataList: Array<
        IndexMetadataDTO & {
          indexFieldMetadataList: IndexFieldMetadataDTO[];
        }
      >;
    }
  >;
};
