import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import {
  ExtractFlatObjectMetadataMapsOutOfFlatObjectMetadataMapsOrThrowArgs,
  extractFlatObjectMetadataMapsOutOfFlatObjectMetadataMapsOrThrow,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/extract-flat-object-metadata-maps-out-of-flat-object-metadata-maps-or-throw.util';

export const extractFlatObjectMetadataMapsOutOfFlatObjectMetadataMaps = (
  args: ExtractFlatObjectMetadataMapsOutOfFlatObjectMetadataMapsOrThrowArgs,
): FlatObjectMetadataMaps | undefined => {
  try {
    return extractFlatObjectMetadataMapsOutOfFlatObjectMetadataMapsOrThrow(
      args,
    );
  } catch {
    return undefined;
  }
};
