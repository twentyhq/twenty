import { FieldMetadataDynamicDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

export const serializeTypeDefaultValue = (
  defaultValue?: FieldMetadataDynamicDefaultValue,
) => {
  if (!defaultValue?.type) {
    return null;
  }

  switch (defaultValue.type) {
    case 'uuid':
      return 'public.uuid_generate_v4()';
    case 'now':
      return 'now()';
    default:
      return null;
  }
};
