import { type ValidationRuleBindings } from './ValidationRuleBindings';

export type ObjectValidationRule = {
  id: string;
  expression: string;
  bindings: ValidationRuleBindings;
  message: string;
  errorFieldMetadataId: string | null;
  isActive: boolean;
};
