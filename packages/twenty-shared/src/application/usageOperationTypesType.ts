// The UsageOperationType subset an app may bill under; the omitted ones are raised by the platform itself,
// and API_REQUEST rows feed the API rate limit.
export const USAGE_OPERATION_TYPES = [
  'AI_CHAT_TOKEN',
  'AI_WORKFLOW_TOKEN',
  'WORKFLOW_EXECUTION',
  'CODE_EXECUTION',
  'WEB_SEARCH',
  'CALL_RECORDING',
  'EMAIL_SEND',
  'APP_OPERATION',
] as const;

// Where app charges land when the app names no platform category.
export const DEFAULT_APP_USAGE_OPERATION_TYPE = 'APP_OPERATION';

export type UsageOperationTypeValue = (typeof USAGE_OPERATION_TYPES)[number];

export const isUsageOperationTypeValue = (
  value: unknown,
): value is UsageOperationTypeValue =>
  USAGE_OPERATION_TYPES.includes(value as UsageOperationTypeValue);
