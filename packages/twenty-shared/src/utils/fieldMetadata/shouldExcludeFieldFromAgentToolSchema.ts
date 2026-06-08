export const shouldExcludeFieldFromAgentToolSchema = ({
  fieldName,
  isSystem,
  excludeId = true,
  additionalExcludedFieldNames = [],
}: {
  fieldName: string;
  isSystem: boolean;
  excludeId?: boolean;
  additionalExcludedFieldNames?: string[];
}): boolean => {
  const excludedFieldNames = [
    'deletedAt',
    'searchVector',
    'createdBy',
    ...additionalExcludedFieldNames,
  ];

  if (excludeId) {
    excludedFieldNames.push('id');
  }

  return excludedFieldNames.includes(fieldName) || isSystem;
};
