import {
  type FormulaEvaluator,
  type FormulaFieldMetadataType,
} from 'twenty-shared/types';

import { type FormulaFieldDependency } from 'src/engine/metadata-modules/formula-field/types/formula-field-dependency.type';
import { type FormulaFieldLookup } from 'src/engine/metadata-modules/formula-field/types/formula-field-lookup.type';

export type FormulaFieldEvaluationPlan = {
  fieldMetadataId: string;
  fieldMetadataType: FormulaFieldMetadataType;
  fieldName: string;
  ownFields: FormulaFieldDependency[];
  lookups: FormulaFieldLookup[];
  evaluate: FormulaEvaluator;
};
