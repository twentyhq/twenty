import { type FieldMetadataComputationBindings } from '@/types/FieldMetadataComputationBindings';
export type FieldMetadataFormulaComputation = {
  kind: 'FORMULA';
  expression: string;
  bindings?: FieldMetadataComputationBindings;
};
