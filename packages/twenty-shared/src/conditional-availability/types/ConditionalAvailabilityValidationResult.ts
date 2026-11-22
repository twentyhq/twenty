import { type ConditionalAvailabilityNode } from '@/conditional-availability/types/ConditionalAvailabilityNode';

export type ConditionalAvailabilityValidationResult =
  | { isValid: true; node: ConditionalAvailabilityNode | null }
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
