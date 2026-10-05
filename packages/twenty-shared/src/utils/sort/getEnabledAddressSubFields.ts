import { DEFAULT_VISIBLE_ADDRESS_SUBFIELDS } from '@/constants';
import {
  type AllowedAddressSubField,
  type FieldMetadataSettingsMapping,
  type FieldMetadataType,
} from '@/types';
import { isNonEmptyArray } from '@/utils';

export const getEnabledAddressSubFields = (
  settings:
    | FieldMetadataSettingsMapping[FieldMetadataType.ADDRESS]
    | null
    | undefined,
): readonly AllowedAddressSubField[] => {
  if (isNonEmptyArray(settings?.subFields)) {
    return settings.subFields;
  }
  return DEFAULT_VISIBLE_ADDRESS_SUBFIELDS;
};
