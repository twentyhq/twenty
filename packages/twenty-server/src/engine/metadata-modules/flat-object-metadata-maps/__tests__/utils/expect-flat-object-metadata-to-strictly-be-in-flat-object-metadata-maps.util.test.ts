import { jestExpectToBeDefined } from 'test/utils/expect-to-be-defined.util.test';

import { expectFlatFieldMetadataToBeInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/__tests__/utils/expect-flat-field-metadata-to-be-in-flat-object-metadata-maps.util.test';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { deleteFieldFromFlatObjectMetadataWithFlatFieldMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-with-flat-field-maps-or-throw.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type ExpectFlatObjectMetadataToBeInFlatObjectMetadataMapsArgs = {
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
  flatObjectMetadata: FlatObjectMetadata;
};
export const expectFlatObjectMetadataToStrictlyBeInFlatObjectMetadataMaps = ({
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

        return deleteFieldFromFlatObjectMetadataWithFlatFieldMapsOrThrow({
          fieldMetadataId: flatFieldMetadata.id,
          flatObjectMetadataWithFlatFieldMaps,
        });
      },
      flatObjectMetadataWithFlatFieldMaps,
    );

  expect(finalObjectMetadataWithFlatFieldMaps).toEqual({
    ...flatObjectMetadata,
    flatFieldMetadatas: [],
    fieldsById: {},
    fieldIdByJoinColumnName: {},
    fieldIdByName: {},
  });
};
