import { FieldMetadataFunctionDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

export const serializeFunctionDefaultValue = (
  defaultValue?: FieldMetadataFunctionDefaultValue['value'],
) => {
  switch (defaultValue) {
    case 'uuid':
      return 'public.uuid_generate_v4()';
    case 'now':
      return 'now()';
    default:
      return null;
  }
};
