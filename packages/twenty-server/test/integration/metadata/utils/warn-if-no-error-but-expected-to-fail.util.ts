import { isDefined } from 'class-validator';
import { CommonResponseBody } from 'test/integration/types/common-response-body.type';

type WarnIfNoErrorButExpectedToFailInput = {
  response: Awaited<CommonResponseBody<unknown>>;
  errorMessage: string;
};

export const warnIfNoErrorButExpectedToFail = ({
  response,
  errorMessage,
}: WarnIfNoErrorButExpectedToFailInput) => {
  if (isDefined(response.data)) {
    expect(false).toEqual(errorMessage);
  }
  expect(response.errors.length).toBeGreaterThan(0);
};
