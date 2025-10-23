import { type Response } from 'supertest';
import { isDefined } from 'twenty-shared/utils';

type WarnIfErrorButNotExpectedToFailInput = {
  response: Response;
  errorMessage: string;
};

export const warnIfErrorButNotExpectedToFail = ({
  response,
  errorMessage,
}: WarnIfErrorButNotExpectedToFailInput) => {
  if (isDefined(response.body.errors) && response.body.errors.length > 0) {
    if (
      isDefined(process.env.LOG_LEVELS) &&
      process.env.LOG_LEVELS.includes('debug')
    ) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(response.body.errors, null, 2));
    }
    expect(response.body.errors).toEqual(errorMessage);
  }
  expect(response.body.data).toBeDefined();
};
