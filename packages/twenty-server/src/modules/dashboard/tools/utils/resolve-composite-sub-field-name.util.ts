import { type FieldMetadataType } from 'twenty-shared/types';

import { getCompositeSubFieldNames } from 'src/modules/dashboard/tools/utils/get-composite-sub-field-names.util';

const normalize = (value: string) => value.trim().toLowerCase();

export const resolveCompositeSubFieldName = (
  input: string,
  fieldType: FieldMetadataType,
) => {
  const allowed = getCompositeSubFieldNames(fieldType);
  const normalizedInput = normalize(input);

  return allowed.find((value) => normalize(value) === normalizedInput) ?? null;
};
