import { type ValidationRuleBindings } from './ValidationRuleBindings';
import { type ValidationRuleErrorCode } from './ValidationRuleErrorCode';
import { type ValidationRuleErrorParams } from './ValidationRuleErrorParams';

export type ValidationRuleCompilationResult =
  | { isValid: true; bindings: ValidationRuleBindings }
  | {
      isValid: false;
      errorMessage: string;
      errorCode?: ValidationRuleErrorCode;
      errorParams?: ValidationRuleErrorParams;
    };
