import { type UsageOperationTypeValue } from '@/application/usageOperationTypesType';

export type BillableOperationManifest = {
  operationType: UsageOperationTypeValue;
  label: string;
};

// Keyed by the operation name the application charges against.
export type BillableOperations = Partial<
  Record<string, BillableOperationManifest>
>;
