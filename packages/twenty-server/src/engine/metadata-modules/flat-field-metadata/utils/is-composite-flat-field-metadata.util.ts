import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataEntityOfTypes } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';

export const isCompositeFlatFieldMetadata = (
  flatFieldMetadata: FlatFieldMetadata,
): flatFieldMetadata is FlatFieldMetadata<CompositeFieldMetadataType> =>
  isFlatFieldMetadataEntityOfTypes(flatFieldMetadata, [
    FieldMetadataType.ADDRESS,
    FieldMetadataType.CURRENCY,
    FieldMetadataType.FULL_NAME,
    FieldMetadataType.LINKS,
    FieldMetadataType.EMAILS,
    FieldMetadataType.PHONES,
    FieldMetadataType.RICH_TEXT_V2,
    FieldMetadataType.ACTOR,
  ]);
