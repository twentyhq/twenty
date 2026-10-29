import { type UsageOperationTypeValue } from '@/application/usageOperationTypesType';

export type BillableOperationManifest = {
  // Defaults to APP_OPERATION; `label` names the operation in the app's credit monitoring either way
  operationType?: UsageOperationTypeValue;
  label: string;
};

// Keyed by the operation name the application charges against.
export type BillableOperations = Partial<
  Record<string, BillableOperationManifest>
>;
