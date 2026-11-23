import { type FormulaEvaluator } from 'twenty-shared/types';

import { type FormulaFieldDependency } from 'src/engine/metadata-modules/formula-field/types/formula-field-dependency.type';
import { type FormulaFieldLookup } from 'src/engine/metadata-modules/formula-field/types/formula-field-lookup.type';

export type FormulaFieldEvaluationPlan = {
  fieldName: string;
  ownFields: FormulaFieldDependency[];
  lookups: FormulaFieldLookup[];
  evaluate: FormulaEvaluator;
};
