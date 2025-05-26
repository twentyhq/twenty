import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';

export type EnumFieldMetadataEntity = FieldMetadataEntity<
  | FieldMetadataType.SELECT
  | FieldMetadataType.RATING
  | FieldMetadataType.MULTI_SELECT
>;
export const isEnumFieldMetadata = (
  fieldMetadata: unknown,
): fieldMetadata is EnumFieldMetadataEntity => {
  if (!(fieldMetadata instanceof FieldMetadataEntity)) {
    return false;
  }

  return isEnumFieldMetadataType(fieldMetadata.type);
};
