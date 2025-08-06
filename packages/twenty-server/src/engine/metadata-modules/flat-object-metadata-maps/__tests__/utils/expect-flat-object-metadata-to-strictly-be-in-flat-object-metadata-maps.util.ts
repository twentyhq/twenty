import { expectFlatFieldMetadataToBeInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/__tests__/utils/expect-flat-field-metadata-to-be-in-flat-object-metadata-maps.util';
import { jestExpectToBeDefined } from 'src/engine/metadata-modules/flat-object-metadata-maps/__tests__/utils/expect-to-be-defined.util';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { deleteFieldFromFlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-with-flat-field-maps.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type ExpectFlatObjectMetadataToBeInFlatObjectMetadataMapsArgs = {
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
  flatObjectMetadata: FlatObjectMetadata;
};
export const expectFlatFieldMetadataToStrictlyBeInFlatObjectMetadataMaps = ({
  flatObjectMetadataMaps,
  flatObjectMetadata,
}: ExpectFlatObjectMetadataToBeInFlatObjectMetadataMapsArgs) => {
  const { id: objectMetadataId } = flatObjectMetadata;
  const flatObjectMetadataWithFlatFieldMaps =
    flatObjectMetadataMaps.byId[objectMetadataId];
  expect(
    flatObjectMetadataMaps.idByNameSingular[flatObjectMetadata.nameSingular],
  ).toEqual(objectMetadataId);
  jestExpectToBeDefined(flatObjectMetadataWithFlatFieldMaps);

  const finalObjectMetadataWithFlatFieldMaps =
    flatObjectMetadata.flatFieldMetadatas.reduce(
      (flatObjectMetadataWithFlatFieldMaps, flatFieldMetadata) => {
        expectFlatFieldMetadataToBeInFlatObjectMetadataMaps({
          flatFieldMetadata,
          flatObjectMetadataMaps,
        });

        return deleteFieldFromFlatObjectMetadataWithFlatFieldMaps({
          fieldMetadataId: flatFieldMetadata.id,
          flatObjectMetadataWithFlatFieldMaps,
        });
      },
      flatObjectMetadataWithFlatFieldMaps,
    );

  expect(finalObjectMetadataWithFlatFieldMaps).toEqual({
    ...flatObjectMetadata,
    fieldsById: {},
    fieldIdByJoinColumnName: {},
    fieldIdByName: {},
  });
};
