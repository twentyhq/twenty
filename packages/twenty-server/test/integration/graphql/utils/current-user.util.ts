import gql from 'graphql-tag';

import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

type CurrentUserUtilArgs = {
  accessToken: string;
  expectToFail?: boolean;
};

export const getCurrentUser = async ({
  accessToken,
  expectToFail,
}: CurrentUserUtilArgs): CommonResponseBody<{
  currentUser: UserEntity;
}> => {
  const query = gql`
    query CurrentUser {
      currentUser {
        id
        email
        firstName
        lastName
        defaultAvatarUrl
        isEmailVerified
        disabled
        canImpersonate
        canAccessFullAdminPanel
        locale
        createdAt
        updatedAt
        deletedAt
        currentWorkspace {
          id
          displayName
          subdomain
          activationStatus
          logo
        }
        currentUserWorkspace {
          id
          userId
          workspaceId
        }
      }
    }
  `;

  const response = await makeGraphqlAPIRequest(
    {
      query,
      variables: {},
    },
    accessToken,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Get current user should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Get current user has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};

