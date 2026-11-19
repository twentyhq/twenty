export const isFieldMetadataOptionActive = (option: {
  isActive?: boolean | null;
}): boolean => option.isActive !== false;
