import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import {
  type GetSubFlatObjectMetadataMapsOfSpecificFieldsOrThrowArgs,
  getSubFlatObjectMetadataMapsOutOfFlatFieldMetadatasOrThrow,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/get-sub-flat-object-metadata-maps-out-of-flat-field-metadatas-or-throw.util';

export const getSubFlatObjectMetadataMapsOutOfFlatFieldMetadatas = (
  args: GetSubFlatObjectMetadataMapsOfSpecificFieldsOrThrowArgs,
): FlatObjectMetadataMaps | undefined => {
  try {
    return getSubFlatObjectMetadataMapsOutOfFlatFieldMetadatasOrThrow(args);
  } catch {
    return undefined;
  }
};
