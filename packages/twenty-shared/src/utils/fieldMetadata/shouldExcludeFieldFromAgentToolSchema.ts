import { EXCLUDED_FIELD_NAMES_FROM_AGENT_TOOL_SCHEMA } from '@/constants';

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
    ...EXCLUDED_FIELD_NAMES_FROM_AGENT_TOOL_SCHEMA,
    ...additionalExcludedFieldNames,
  ];

  if (excludeId) {
    excludedFieldNames.push('id');
  }

  return excludedFieldNames.includes(fieldName) || isSystem;
};
