import { type PERSON_HANDLE_FIELD_TYPES } from 'src/modules/match-participant/person-handle-field/constants/person-handle-field-types.constant';

// A person field that participant handles of a channel are looked up in.
export type PersonHandleField = {
  name: string;
  type: (typeof PERSON_HANDLE_FIELD_TYPES)[number];
};
