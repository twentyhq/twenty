import { jestExpectToBeDefined } from 'test/utils/expect-to-be-defined.util.test';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataEntityOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';

type ExpectFlatFieldMetadataToBeInFlatObjectMetadataMapsArgs = {
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
  flatFieldMetadata: FlatFieldMetadata;
};
export const expectFlatFieldMetadataToBeInFlatObjectMetadataMaps = ({
  flatFieldMetadata,
  flatObjectMetadataMaps,
}: ExpectFlatFieldMetadataToBeInFlatObjectMetadataMapsArgs) => {
  const { objectMetadataId, id: flatFieldMetadataId } = flatFieldMetadata;
  const petObject = flatObjectMetadataMaps.byId[objectMetadataId];

  jestExpectToBeDefined(petObject);

  if (
    isFlatFieldMetadataEntityOfType(
      flatFieldMetadata,
      FieldMetadataType.RELATION,
    ) &&
    isDefined(flatFieldMetadata.settings.joinColumnName)
  ) {
    expect(
      petObject.fieldIdByJoinColumnName[
        flatFieldMetadata.settings.joinColumnName
      ],
    ).toEqual(flatFieldMetadataId);
  }

  expect(petObject.fieldsById[flatFieldMetadataId]).toBeDefined();
  expect(petObject.fieldsById[flatFieldMetadataId]).toEqual(flatFieldMetadata);
  expect(petObject.fieldIdByName[flatFieldMetadata.name]).toEqual(
    flatFieldMetadataId,
  );
};
