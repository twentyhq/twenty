import { jestExpectToBeDefined } from 'test/utils/expect-to-be-defined.util.test';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';

type ExpectFlatFieldMetadataToBeInFlatObjectMetadataMapsArgs = {
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
  flatFieldMetadata: FlatFieldMetadata;
};
export const expectFlatFieldMetadataToBeInFlatObjectMetadataMaps = ({
  flatFieldMetadata,
  flatObjectMetadataMaps,
}: ExpectFlatFieldMetadataToBeInFlatObjectMetadataMapsArgs) => {
  const { objectMetadataId, id: flatFieldMetadataId } = flatFieldMetadata;
  const matchingFlatObjectMetadata =
    flatObjectMetadataMaps.byId[objectMetadataId];

  jestExpectToBeDefined(matchingFlatObjectMetadata);

  if (
    isFlatFieldMetadataOfType(
      flatFieldMetadata,
      FieldMetadataType.RELATION,
    ) &&
    isDefined(flatFieldMetadata.settings.joinColumnName)
  ) {
    expect(
      matchingFlatObjectMetadata.fieldIdByJoinColumnName[
        flatFieldMetadata.settings.joinColumnName
      ],
    ).toEqual(flatFieldMetadataId);
  }

  expect(
    matchingFlatObjectMetadata.fieldsById[flatFieldMetadataId],
  ).toBeDefined();
  expect(matchingFlatObjectMetadata.fieldsById[flatFieldMetadataId]).toEqual(
    flatFieldMetadata,
  );
  expect(matchingFlatObjectMetadata.flatFieldMetadatas).toContain(
    flatFieldMetadata,
  );
  expect(
    matchingFlatObjectMetadata.fieldIdByName[flatFieldMetadata.name],
  ).toEqual(flatFieldMetadataId);
};
