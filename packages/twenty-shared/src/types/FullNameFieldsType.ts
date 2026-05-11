export const ALLOWED_FULL_NAME_SUBFIELDS = ['firstName', 'lastName'] as const;

export type AllowedFullNameSubField =
  (typeof ALLOWED_FULL_NAME_SUBFIELDS)[number];
