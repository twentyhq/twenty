import { type ALLOWED_FULL_NAME_SUBFIELDS } from '@/constants/AllowedFullNameSubfields';

export type AllowedFullNameSubField =
  (typeof ALLOWED_FULL_NAME_SUBFIELDS)[number];
