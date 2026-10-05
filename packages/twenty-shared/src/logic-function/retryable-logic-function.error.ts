export const RETRYABLE_LOGIC_FUNCTION_ERROR_NAME =
  'RetryableLogicFunctionError';

export class RetryableLogicFunctionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = RETRYABLE_LOGIC_FUNCTION_ERROR_NAME;
  }
}
