export type RestrictedFields = Record<
  string,
  { canRead?: boolean | null; canUpdate?: boolean | null }
>;
