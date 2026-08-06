import { gql } from 'graphql-tag';

export const currentUserIdentityQueryFactory = () => {
  return {
    query: gql`
      query CurrentUser {
        currentUser {
          id
          email
        }
      }
    `,
    variables: {},
  };
};

export const currentUserWorkspaceContextQueryFactory = () => {
  return {
    query: gql`
      query CurrentUserWorkspaceContext {
        currentUser {
          id
          email
          currentWorkspace {
            id
          }
          currentUserWorkspace {
            id
          }
        }
      }
    `,
    variables: {},
  };
};

export const currentUserSessionsQueryFactory = () => {
  return {
    query: gql`
      query CurrentUserSessions {
        currentUserSessions {
          id
          workspaceId
          authProvider
          isImpersonating
          isCurrent
          lastActiveAt
          expiresAt
        }
      }
    `,
    variables: {},
  };
};

export const revokeUserSessionQueryFactory = ({
  userSessionId,
}: {
  userSessionId: string;
}) => {
  return {
    query: gql`
      mutation RevokeUserSession($userSessionId: UUID!) {
        revokeUserSession(userSessionId: $userSessionId)
      }
    `,
    variables: { userSessionId },
  };
};

export const revokeAllOtherUserSessionsQueryFactory = () => {
  return {
    query: gql`
      mutation RevokeAllOtherUserSessions {
        revokeAllOtherUserSessions
      }
    `,
    variables: {},
  };
};

export const signOutQueryFactory = ({
  refreshToken,
}: {
  refreshToken?: string;
} = {}) => {
  return {
    query: gql`
      mutation SignOut($refreshToken: String) {
        signOut(refreshToken: $refreshToken)
      }
    `,
    variables: { refreshToken },
  };
};
