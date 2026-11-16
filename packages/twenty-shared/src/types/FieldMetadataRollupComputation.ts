import { type FieldMetadataComputationBindings } from '@/types/FieldMetadataComputationBindings';
import { type FieldMetadataRollupOperation } from '@/types/FieldMetadataRollupOperation';

// `expression` and `filter` are evaluated on each related record; COUNT takes no expression
export type FieldMetadataRollupComputation = {
  kind: 'ROLLUP';
  relationFieldName: string;
  operation: FieldMetadataRollupOperation;
  expression?: string;
  filter?: string;
  bindings?: FieldMetadataComputationBindings;
};
