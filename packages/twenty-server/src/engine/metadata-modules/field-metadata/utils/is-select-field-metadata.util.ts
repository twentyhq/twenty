import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  EnumFieldMetadataUnionType,
  isEnumFieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';

export const isSelectFieldMetadata = (
  fieldMetadata: unknown,
): fieldMetadata is FieldMetadataEntity<EnumFieldMetadataUnionType> => {
  if (!(fieldMetadata instanceof FieldMetadataEntity)) {
    return false;
  }

  return isEnumFieldMetadataType(fieldMetadata.type);
};
