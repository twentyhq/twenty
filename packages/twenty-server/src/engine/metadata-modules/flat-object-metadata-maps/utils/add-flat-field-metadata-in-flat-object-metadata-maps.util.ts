import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { AddFlatFieldMetadataInFlatObjectMetadataMapsOrThrowArgs } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';

export const addFlatFieldMetadataInFlatObjectMetadataMaps = (
  arg: AddFlatFieldMetadataInFlatObjectMetadataMapsOrThrowArgs,
): FlatObjectMetadataMaps | undefined => {
  try {
    return addFlatFieldMetadataInFlatObjectMetadataMaps(arg);
  } catch (e) {
    return undefined;
  }
};
