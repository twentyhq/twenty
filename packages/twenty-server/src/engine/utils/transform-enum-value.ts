import { type FieldMetadataDefaultOption } from 'twenty-shared/types';

export function transformEnumValue(options?: FieldMetadataDefaultOption[]) {
  return options?.map((option) => {
    if (/^\d/.test(option.value)) {
      return {
        ...option,
        value: `_${option.value}`,
      };
    }

    return option;
  });
}
