import { type FieldMetadataFormulaComputation } from '@/types/FieldMetadataFormulaComputation';
import { type FieldMetadataRollupComputation } from '@/types/FieldMetadataRollupComputation';

// Fields are referenced by name, as in an API query, so a computation reads the same in every workspace
export type FieldMetadataComputation =
  | FieldMetadataFormulaComputation
  | FieldMetadataRollupComputation;
