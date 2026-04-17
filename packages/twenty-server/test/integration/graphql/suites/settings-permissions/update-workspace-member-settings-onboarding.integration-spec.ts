import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import request from 'supertest';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APPLE_WORKSPACE_INVITE_HASH = 'apple.dev-invite-hash';

describe('updateWorkspaceMemberSettings and profile onboarding', () => {
  let newUserAccessToken: string | undefined;
  let originalIsPublicInviteLinkEnabled: boolean;

  beforeAll(async () => {
    const currentWorkspaceQuery = gql`
      query CurrentWorkspacePublicInvite {
        currentWorkspace {
          isPublicInviteLinkEnabled
        }
      }
    `;

    const response = await makeMetadataAPIRequest(
      {
        query: currentWorkspaceQuery,
        variables: {},
      },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.currentWorkspace).toBeDefined();

    originalIsPublicInviteLinkEnabled =
      response.body.data.currentWorkspace.isPublicInviteLinkEnabled;
  });

  afterAll(async () => {
    const restoreMutation = gql`
      mutation RestoreWorkspacePublicInvite($data: UpdateWorkspaceInput!) {
        updateWorkspace(data: $data) {
          id
          isPublicInviteLinkEnabled
        }
      }
    `;

    await makeMetadataAPIRequest(
      {
        query: restoreMutation,
        variables: {
          data: {
            isPublicInviteLinkEnabled: originalIsPublicInviteLinkEnabled,
          },
        },
      },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );
  });

  afterEach(async () => {
    if (!newUserAccessToken) {
      return;
    }

    await deleteUser({
      accessToken: newUserAccessToken,
      expectToFail: false,
    });
    newUserAccessToken = undefined;
  });

  it('should clear PROFILE_CREATION onboarding after saving first and last name via updateWorkspaceMemberSettings', async () => {
    const client = request(`http://localhost:${APP_PORT}`);

    const enablePublicInviteLinkMutation = {
      query: `
        mutation UpdateWorkspace {
          updateWorkspace(data: { isPublicInviteLinkEnabled: true }) {
            id
            isPublicInviteLinkEnabled
          }
        }
      `,
    };

    await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(enablePublicInviteLinkMutation)
      .expect(200)
      .expect((response) => {
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.updateWorkspace.isPublicInviteLinkEnabled).toBe(
          true,
        );
      });

    const uniqueEmail = `profile-onboarding-${randomUUID()}@example.com`;
    const password = 'Password123!';

    const signUpInWorkspaceMutation = gql`
      mutation SignUpInWorkspace(
        $email: String!
        $password: String!
        $workspaceInviteHash: String
        $workspaceId: UUID
      ) {
        signUpInWorkspace(
          email: $email
          password: $password
          workspaceInviteHash: $workspaceInviteHash
          workspaceId: $workspaceId
        ) {
          loginToken {
            token
          }
          workspace {
            id
            workspaceUrls {
              subdomainUrl
            }
          }
        }
      }
    `;

    const signUpResponse = await makeMetadataAPIRequest(
      {
        query: signUpInWorkspaceMutation,
        variables: {
          email: uniqueEmail,
          password,
          workspaceInviteHash: APPLE_WORKSPACE_INVITE_HASH,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
        },
      },
      undefined,
    );

    expect(signUpResponse.status).toBe(200);
    expect(signUpResponse.body.errors).toBeUndefined();

    const signUpPayload = signUpResponse.body.data.signUpInWorkspace;

    expect(signUpPayload.loginToken.token).toBeDefined();

    await testDataSource.query(
      'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
      [uniqueEmail],
    );

    const origin =
      signUpPayload.workspace.workspaceUrls?.subdomainUrl ??
      'http://localhost:3001';

    const {
      data: { getAuthTokensFromLoginToken: authTokensData },
    } = await getAuthTokensFromLoginToken({
      loginToken: signUpPayload.loginToken.token,
      origin,
      expectToFail: false,
    });

    newUserAccessToken =
      authTokensData.tokens.accessOrWorkspaceAgnosticToken.token;

    const currentUserWithOnboardingQuery = gql`
      query CurrentUserWithOnboarding {
        currentUser {
          id
          onboardingStatus
        }
      }
    `;

    const beforeNameUpdateResponse = await makeMetadataAPIRequest(
      {
        query: currentUserWithOnboardingQuery,
        variables: {},
      },
      newUserAccessToken,
    );

    expect(beforeNameUpdateResponse.status).toBe(200);
    expect(beforeNameUpdateResponse.body.errors).toBeUndefined();
    expect(beforeNameUpdateResponse.body.data.currentUser.onboardingStatus).toBe(
      OnboardingStatus.PROFILE_CREATION,
    );

    const workspaceMemberQuery = gql`
      query WorkspaceMemberForProfileOnboarding(
        $workspaceMemberFilter: WorkspaceMemberFilterInput!
      ) {
        workspaceMember(filter: $workspaceMemberFilter) {
          id
        }
      }
    `;

    const workspaceMemberResponse = await makeGraphqlAPIRequest(
      {
        query: workspaceMemberQuery,
        variables: {
          workspaceMemberFilter: {
            userEmail: {
              eq: uniqueEmail,
            },
          },
        },
      },
      newUserAccessToken,
    );

    expect(workspaceMemberResponse.status).toBe(200);
    expect(workspaceMemberResponse.body.errors).toBeUndefined();

    const workspaceMemberId =
      workspaceMemberResponse.body.data.workspaceMember?.id;

    expect(workspaceMemberId).toBeDefined();

    const updateWorkspaceMemberSettingsMutation = gql`
      mutation UpdateWorkspaceMemberSettings(
        $input: UpdateWorkspaceMemberSettingsInput!
      ) {
        updateWorkspaceMemberSettings(input: $input)
      }
    `;

    const updateNameResponse = await makeMetadataAPIRequest(
      {
        query: updateWorkspaceMemberSettingsMutation,
        variables: {
          input: {
            workspaceMemberId,
            update: {
              name: {
                firstName: 'Onboarding',
                lastName: 'Integration',
              },
            },
          },
        },
      },
      newUserAccessToken,
    );

    expect(updateNameResponse.status).toBe(200);
    expect(updateNameResponse.body.errors).toBeUndefined();
    expect(updateNameResponse.body.data.updateWorkspaceMemberSettings).toBe(true);

    const afterNameUpdateResponse = await makeMetadataAPIRequest(
      {
        query: currentUserWithOnboardingQuery,
        variables: {},
      },
      newUserAccessToken,
    );

    expect(afterNameUpdateResponse.status).toBe(200);
    expect(afterNameUpdateResponse.body.errors).toBeUndefined();
    expect(
      afterNameUpdateResponse.body.data.currentUser.onboardingStatus,
    ).not.toBe(OnboardingStatus.PROFILE_CREATION);
    expect(afterNameUpdateResponse.body.data.currentUser.onboardingStatus).toBe(
      OnboardingStatus.COMPLETED,
    );
  });
});
