import { type AllowedAddressSubField } from '@/types/AddressFieldsType';

export const DEFAULT_VISIBLE_ADDRESS_SUBFIELDS = [
  'addressStreet1',
  'addressStreet2',
  'addressCity',
  'addressState',
  'addressPostcode',
  'addressCountry',
] as const satisfies readonly AllowedAddressSubField[];
