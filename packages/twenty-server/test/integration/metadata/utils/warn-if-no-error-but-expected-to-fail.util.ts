import { isDefined } from 'class-validator';
import { type Response } from 'supertest';

type WarnIfNoErrorButExpectedToFailInput = {
  response: Response;
  errorMessage: string;
};

export const warnIfNoErrorButExpectedToFail = ({
  response,
  errorMessage,
}: WarnIfNoErrorButExpectedToFailInput) => {
  if (!isDefined(response.body.errors) || response.body.errors.length === 0) {
    expect(false).toEqual(errorMessage);
  }
  expect(response.body.errors.length).toBeGreaterThan(0);
};
