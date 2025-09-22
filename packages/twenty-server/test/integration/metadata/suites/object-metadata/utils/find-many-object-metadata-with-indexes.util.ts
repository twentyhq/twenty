import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import { IndexFieldMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-field-metadata.dto';
import { IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';

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
