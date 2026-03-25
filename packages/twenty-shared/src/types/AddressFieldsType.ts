export const ALLOWED_ADDRESS_SUBFIELDS = [
  'addressStreet1',
  'addressStreet2',
  'addressCity',
  'addressState',
  'addressPostcode',
  'addressCountry',
  'addressLat',
  'addressLng',
] as const;

export type AllowedAddressSubField = (typeof ALLOWED_ADDRESS_SUBFIELDS)[number];
