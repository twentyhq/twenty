import { isDefined } from 'class-validator';
import { type Response } from 'supertest';

type WarnIfErrorButNotExpectedToFailInput = {
  response: Response;
  errorMessage: string;
};

export const warnIfErrorButNotExpectedToFail = ({
  response,
  errorMessage,
}: WarnIfErrorButNotExpectedToFailInput) => {
  if (isDefined(response.body.errors) && response.body.errors.length > 0) {
    expect(response.body.errors).toEqual(errorMessage);
  }
  expect(response.body.data).toBeDefined();
};
