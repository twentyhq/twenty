type DeprecatedRestrictedFields = Record<
  string,
  { canRead: boolean | null; canUpdate: boolean | null }
>;

// Fronts cached before the deploy still select restrictedFields
export const buildDeprecatedRestrictedFields = ({
  unreadableFields,
  uneditableFields,
}: {
  unreadableFields: string[];
  uneditableFields: string[];
}): DeprecatedRestrictedFields =>
  Object.fromEntries(
    [...new Set([...unreadableFields, ...uneditableFields])].map(
      (fieldMetadataId) => [
        fieldMetadataId,
        {
          canRead: unreadableFields.includes(fieldMetadataId) ? false : null,
          canUpdate: uneditableFields.includes(fieldMetadataId) ? false : null,
        },
      ],
    ),
  );
