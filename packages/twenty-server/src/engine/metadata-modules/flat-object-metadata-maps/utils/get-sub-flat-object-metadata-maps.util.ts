import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import {
  getSubFlatObjectMetadataMapsOrThrow,
  type GetSubFlatObjectMetadataMapsOrThrowArgs,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/get-sub-flat-object-metadata-maps-or-throw.util';

export const getSubFlatObjectMetadataMaps = (
  args: GetSubFlatObjectMetadataMapsOrThrowArgs,
): FlatObjectMetadataMaps | undefined => {
  try {
    return getSubFlatObjectMetadataMapsOrThrow(args);
  } catch {
    return undefined;
  }
};
