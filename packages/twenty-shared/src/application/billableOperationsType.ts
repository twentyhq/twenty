// Billing categories the platform meters against. Mirrors the server's
// UsageOperationType enum so a manifest can name a category without importing
// server code.
export const USAGE_OPERATION_TYPES = [
  'AI_CHAT_TOKEN',
  'AI_WORKFLOW_TOKEN',
  'WORKFLOW_EXECUTION',
  'CODE_EXECUTION',
  'WEB_SEARCH',
  'CALL_RECORDING',
  'EMAIL_SEND',
] as const;

export type UsageOperationTypeValue = (typeof USAGE_OPERATION_TYPES)[number];

export const isUsageOperationTypeValue = (
  value: unknown,
): value is UsageOperationTypeValue =>
  USAGE_OPERATION_TYPES.includes(value as UsageOperationTypeValue);

export type BillableOperationManifest = {
  operationType: UsageOperationTypeValue;
  label: string;
};

// Keyed by the operation name the application charges against.
export type BillableOperations = Partial<
  Record<string, BillableOperationManifest>
>;
