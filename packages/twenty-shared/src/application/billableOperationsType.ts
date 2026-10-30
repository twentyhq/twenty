import { type UsageOperationTypeValue } from '@/application/usageOperationTypesType';

export type BillableOperationManifest = {
  // Defaults to APP_OPERATION; `label` names the operation in the app's credit monitoring either way
  operationType?: UsageOperationTypeValue;
  label: string;
  // A Twenty icon name (e.g. `IconUserSearch`) shown next to the label in the app's credits breakdown
  icon?: string;
};

// Keyed by the operation name the application charges against.
export type BillableOperations = Partial<
  Record<string, BillableOperationManifest>
>;
