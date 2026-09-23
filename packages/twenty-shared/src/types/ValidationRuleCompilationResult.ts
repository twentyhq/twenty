import { type ValidationRuleBindings } from './ValidationRuleBindings';

export type ValidationRuleCompilationResult =
  | { isValid: true; bindings: ValidationRuleBindings }
  | { isValid: false; errorMessage: string };
