import { print } from 'graphql';
import gql from 'graphql-tag';
import request from 'supertest';
import { asWorkspaceRequest } from 'test/integration/graphql/suites/auth/cookie-session/utils/as-workspace-request.util';
import { extractSessionCookie } from 'test/integration/graphql/suites/auth/cookie-session/utils/extract-session-cookie.util';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';

export const getCurrentUserWithSessionCookie = async ({
  sessionCookie,
  expectToFail,
}: {
  sessionCookie: string;
  expectToFail?: boolean;
}): Promise<{
  data: { currentUser: Pick<UserEntity, 'id' | 'email'> };
  errors: BaseGraphQLError[];
  responseSessionCookie: string | undefined;
}> => {
  const query = gql`
    query CurrentUser {
      currentUser {
        id
        email
      }
    }
  `;

  const response = await asWorkspaceRequest(
    request(`http://localhost:${APP_PORT}`).post('/metadata'),
  )
    .set('Cookie', sessionCookie)
    .send({ query: print(query) });

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Get current user with session cookie should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Get current user with session cookie has failed but should not',
    });
  }

  return {
    data: response.body.data,
    errors: response.body.errors,
    responseSessionCookie: extractSessionCookie(response.headers['set-cookie']),
  };
};
