import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';

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
    const uniqueEmail = `profile-onboarding-${randomUUID()}@example.com`;

    newUserAccessToken =
      await signUpInWorkspaceAndGetAccessToken(uniqueEmail);

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
    expect(
      beforeNameUpdateResponse.body.data.currentUser.onboardingStatus,
    ).toBe(OnboardingStatus.PROFILE_CREATION);

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
    expect(updateNameResponse.body.data.updateWorkspaceMemberSettings).toBe(
      true,
    );

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
