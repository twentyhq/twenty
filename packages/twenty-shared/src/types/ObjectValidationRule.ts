import { type ValidationRuleBindings } from './ValidationRuleBindings';

export type ObjectValidationRule = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  expression: string;
  bindings: ValidationRuleBindings;
  message: string;
  errorFieldMetadataId: string | null;
  isActive: boolean;
};
