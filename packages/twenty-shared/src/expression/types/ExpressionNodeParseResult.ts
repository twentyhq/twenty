import { type ExpressionNode } from '@/expression/types/ExpressionNode';
import { type ValidationRuleErrorCode } from '@/types/ValidationRuleErrorCode';
import { type ValidationRuleErrorParams } from '@/types/ValidationRuleErrorParams';

export type ExpressionNodeParseResult =
  | { isValid: true; node: ExpressionNode }
  | {
      isValid: false;
      errorMessage: string;
      errorCode: ValidationRuleErrorCode;
      errorParams?: ValidationRuleErrorParams;
    };
