export type ConditionalAvailabilityCheckError =
  | {
      isValid: false;
      errorCode: 'RULE_TOO_LARGE';
      errorMessage: string;
      errorParams: { maxNodeCount: number };
    }
  | {
      isValid: false;
      errorCode: 'INVALID_NODE';
      errorMessage: string;
      errorParams: { path: string };
    }
  | {
      isValid: false;
      errorCode: 'UNKNOWN_NAME';
      errorMessage: string;
      errorParams: { name: string };
    };
