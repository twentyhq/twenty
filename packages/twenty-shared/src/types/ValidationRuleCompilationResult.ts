import { type ValidationRuleBindings } from './ValidationRuleBindings';

export type ValidationRuleCompilationResult =
  | { isValid: true; expression: string; bindings: ValidationRuleBindings }
  | { isValid: false; errorMessage: string };
