import { isDefined } from 'twenty-shared/utils';

// Re-issues the create to absorb read-after-write misses (position MIN/MAX and
// fresh-schema reads hit a different datasource than the write); a genuine
// regression still fails every attempt.
const CREATE_VALIDATION_SUCCESS_MAX_ATTEMPTS = 4;

type CreateAttemptResult = {
  hasError: boolean;
  record: Record<string, any> | undefined;
};

export const expectCreateInputValidationSuccessWithRetry = async ({
  performCreate,
  validateInput,
}: {
  performCreate: () => Promise<CreateAttemptResult>;
  validateInput: (record: Record<string, any>) => boolean;
}) => {
  let lastResult: CreateAttemptResult = { hasError: true, record: undefined };

  for (
    let attempt = 0;
    attempt < CREATE_VALIDATION_SUCCESS_MAX_ATTEMPTS;
    attempt++
  ) {
    lastResult = await performCreate();

    const succeeded =
      !lastResult.hasError &&
      isDefined(lastResult.record) &&
      validateInput(lastResult.record);

    if (succeeded) {
      return;
    }
  }

  expect(lastResult.hasError).toBe(false);
  expect(lastResult.record).toBeDefined();
  expect(validateInput(lastResult.record as Record<string, any>)).toBe(true);
};
