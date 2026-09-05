import { appendCommonExceptionCode } from 'src/utils/custom-exception';

export const SharingRuleExceptionCode = appendCommonExceptionCode({
  SHARING_RULE_NOT_FOUND: 'SHARING_RULE_NOT_FOUND',
  INVALID_SHARING_RULE_INPUT: 'INVALID_SHARING_RULE_INPUT',
  OBJECT_METADATA_NOT_FOUND: 'OBJECT_METADATA_NOT_FOUND',
  ROLE_NOT_FOUND: 'ROLE_NOT_FOUND',
} as const);
