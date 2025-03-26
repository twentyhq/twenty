import { isDefined } from 'class-validator';
import { Response } from 'supertest';

type WarnIfNoErrorButExpectedToFailInput = {
  response: Response;
  errorMessage: string;
};

export const warnIfNoErrorButExpectedToFail = ({
  response,
  errorMessage,
}: WarnIfNoErrorButExpectedToFailInput) => {
  if (isDefined(response.body.data)) {
    expect(false).toEqual(errorMessage);
  }
  expect(response.body.errors.length).toBeGreaterThan(0);
};
