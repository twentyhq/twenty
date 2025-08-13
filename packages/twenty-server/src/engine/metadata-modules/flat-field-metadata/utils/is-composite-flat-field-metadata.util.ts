import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataEntityOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';

export const isCompositeFlatFieldMetadata = (
  flatFieldMetadata: FlatFieldMetadata,
): flatFieldMetadata is FlatFieldMetadata<CompositeFieldMetadataType> => {
  return (
    isFlatFieldMetadataEntityOfType(
      flatFieldMetadata,
      FieldMetadataType.ADDRESS,
    ) ||
    isFlatFieldMetadataEntityOfType(
      flatFieldMetadata,
      FieldMetadataType.CURRENCY,
    ) ||
    isFlatFieldMetadataEntityOfType(
      flatFieldMetadata,
      FieldMetadataType.FULL_NAME,
    ) ||
    isFlatFieldMetadataEntityOfType(
      flatFieldMetadata,
      FieldMetadataType.LINKS,
    ) ||
    isFlatFieldMetadataEntityOfType(
      flatFieldMetadata,
      FieldMetadataType.EMAILS,
    ) ||
    isFlatFieldMetadataEntityOfType(
      flatFieldMetadata,
      FieldMetadataType.PHONES,
    ) ||
    isFlatFieldMetadataEntityOfType(
      flatFieldMetadata,
      FieldMetadataType.RICH_TEXT_V2,
    )
  );
};
