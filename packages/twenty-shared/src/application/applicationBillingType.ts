import { type BillableOperations } from '@/application/billableOperationsType';

export type ApplicationBilling = {
  description?: string;
  operations?: BillableOperations;
};
