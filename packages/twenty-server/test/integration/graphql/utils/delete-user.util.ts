import gql from 'graphql-tag';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { type UserEntity } from 'src/engine/core-modules/user/user.entity';

type DeleteUserUtilArgs = {
  accessToken: string;
  expectToFail?: boolean;
};

export const deleteUser = async ({
  accessToken,
  expectToFail,
}: DeleteUserUtilArgs): CommonResponseBody<{
  deleteUser: UserEntity;
}> => {
  const mutation = gql`
    mutation DeleteUser {
      deleteUser {
        id
        email
        firstName
        lastName
        deletedAt
      }
    }
  `;

  const response = await makeGraphqlAPIRequest(
    {
      query: mutation,
      variables: {},
    },
    accessToken,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Delete user should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Delete user has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
