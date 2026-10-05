import { type ValidationRuleBindings } from './ValidationRuleBindings';
import { type ValidationRuleErrorCode } from './ValidationRuleErrorCode';

export type ValidationRuleCompilationResult =
  | { isValid: true; bindings: ValidationRuleBindings }
  | {
      isValid: false;
      errorMessage: string;
      errorCode?: ValidationRuleErrorCode;
    };
