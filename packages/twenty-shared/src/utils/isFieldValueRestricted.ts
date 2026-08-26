import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from '../constants/FieldRestrictedAdditionalPermissionsRequired';

export const isFieldValueRestricted = (value: unknown): boolean =>
  value === FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;
