import { type UsageOperationTypeValue } from '@/application/usageOperationTypesType';

// Usage the platform does not bill, counted from the install; it ends at whichever bound is reached first.
export type BillableOperationFreeAllowance = {
  // In the operation type's metering unit: minutes for CALL_RECORDING
  quantity?: number;
  durationInDays?: number;
  // ISO 8601; workspaces created before it get no allowance
  workspaceCreatedFrom?: string;
};

export type BillableOperationManifest = {
  operationType: UsageOperationTypeValue;
  label: string;
  freeAllowance?: BillableOperationFreeAllowance;
};

// Keyed by the operation name the application charges against.
export type BillableOperations = Partial<
  Record<string, BillableOperationManifest>
>;

const isPositiveSafeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

// Reaches the charge path as untrusted jsonb, so its shape is checked at runtime.
// An allowance without any bound would make the operation free forever, so one is required.
export const isBillableOperationFreeAllowance = (
  value: unknown,
): value is BillableOperationFreeAllowance => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const { quantity, durationInDays, workspaceCreatedFrom } =
    value as Partial<BillableOperationFreeAllowance>;

  return (
    (quantity !== undefined || durationInDays !== undefined) &&
    (quantity === undefined || isPositiveSafeInteger(quantity)) &&
    (durationInDays === undefined || isPositiveSafeInteger(durationInDays)) &&
    (workspaceCreatedFrom === undefined ||
      (typeof workspaceCreatedFrom === 'string' &&
        !Number.isNaN(Date.parse(workspaceCreatedFrom))))
  );
};
