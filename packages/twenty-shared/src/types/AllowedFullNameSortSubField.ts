import { type ALLOWED_FULL_NAME_SORT_SUBFIELDS } from '@/constants/AllowedFullNameSortSubfields';

export type AllowedFullNameSortSubField =
  (typeof ALLOWED_FULL_NAME_SORT_SUBFIELDS)[number];
