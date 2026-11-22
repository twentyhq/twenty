import { type FormulaValue } from 'twenty-shared/types';

import { type FormulaFieldLookup } from 'src/engine/metadata-modules/formula-field/types/formula-field-lookup.type';

export type FormulaFieldEvaluationPlan = {
  fieldName: string;
  ownFieldMetadataIds: string[];
  ownFieldNames: string[];
  ownColumnNames: string[];
  lookups: FormulaFieldLookup[];
  evaluate: (params: {
    record: Record<string, unknown>;
    now: string;
  }) => FormulaValue;
};
