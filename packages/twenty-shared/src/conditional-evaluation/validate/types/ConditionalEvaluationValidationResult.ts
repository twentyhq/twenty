import { type ConditionalEvaluationNode } from '@/conditional-evaluation/common/types/ConditionalEvaluationNode';

export type ConditionalEvaluationValidationResult =
  | { isValid: true; node: ConditionalEvaluationNode | null }
  | {
      isValid: false;
      errorCode: 'INVALID_NODE';
      errorMessage: string;
      errorParams: { path: string };
    }
  | {
      isValid: false;
      errorCode: 'RULE_TOO_LARGE';
      errorMessage: string;
      errorParams: { maxNodeCount: number };
    }
  | {
      isValid: false;
      errorCode: 'UNKNOWN_NAME';
      errorMessage: string;
      errorParams: { name: string };
    };
