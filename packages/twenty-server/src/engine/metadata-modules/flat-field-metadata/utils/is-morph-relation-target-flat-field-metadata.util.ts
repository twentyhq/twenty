import { FieldMetadataType } from 'twenty-shared/types';
import { isMorphRelationHead } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

export const isMorphRelationTargetFlatFieldMetadata = (
  flatFieldMetadata: FlatFieldMetadata,
): flatFieldMetadata is FlatFieldMetadata<FieldMetadataType.MORPH_RELATION> =>
  isFlatFieldMetadataOfType(
    flatFieldMetadata,
    FieldMetadataType.MORPH_RELATION,
  ) && !isMorphRelationHead(flatFieldMetadata);
