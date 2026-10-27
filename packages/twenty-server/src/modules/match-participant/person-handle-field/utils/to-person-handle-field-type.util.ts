import { PERSON_HANDLE_FIELD_TYPES } from 'src/modules/match-participant/person-handle-field/constants/person-handle-field-types.constant';
import { type PersonHandleField } from 'src/modules/match-participant/person-handle-field/types/person-handle-field.type';

export const toPersonHandleFieldType = (
  type: string,
): PersonHandleField['type'] | undefined =>
  PERSON_HANDLE_FIELD_TYPES.find((handleFieldType) => handleFieldType === type);
