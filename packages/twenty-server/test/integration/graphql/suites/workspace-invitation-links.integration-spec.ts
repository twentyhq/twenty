import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { getYcombinatorAdminAccessToken } from 'test/integration/sso/utils/get-ycombinator-admin-access-token.util';
import { sendInvitations } from 'test/integration/graphql/suites/user-session/utils/send-invitations.util';
import {
  buildAppleWorkspaceOrigin,
  buildWorkspaceOriginForSubdomain,
} from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getLoginTokenFromCredentialsQueryFactory } from 'test/integration/graphql/utils/get-login-token-from-credentials.query-factory.util';
import { deleteWorkspaceInvitationsByEmail } from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { signUpInWorkspaceOperationFactory } from 'test/integration/graphql/utils/sign-up-in-workspace-operation-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const PASSWORD = 'Invitation-link-1';

const sendInvitationsWithLinks = (email: string) =>
  makeMetadataApiRequest({
    query: gql`
      mutation SendInvitations($emails: [String!]!) {
        sendInvitations(emails: $emails) {
          result {
            id
          }
          inviteLinks {
            email
            link
          }
        }
      }
    `,
    variables: { emails: [email] },
  });

const getWorkspaceInvitationLink = (appTokenId: string) =>
  makeMetadataApiRequest({
    query: gql`
      query GetWorkspaceInvitationLink($appTokenId: String!) {
        getWorkspaceInvitationLink(appTokenId: $appTokenId)
      }
    `,
    variables: { appTokenId },
  });

describe('workspace invitation links (integration)', () => {
  let email: string;

  beforeEach(() => {
    email = `invitation-link-${randomUUID()}@example.com`;
  });

  afterEach(async () => {
    await deleteWorkspaceInvitationsByEmail({ email });
  });

  it('returns the invitation link when no email provider is configured and verification is off', async () => {
    const sendResponse = await sendInvitationsWithLinks(email);

    expect(sendResponse.body.errors).toBeUndefined();

    const [invitation] = sendResponse.body.data.sendInvitations.result;
    const [inviteLink] = sendResponse.body.data.sendInvitations.inviteLinks;

    expect(inviteLink.email).toBe(email);
    expect(new URL(inviteLink.link).searchParams.get('inviteToken')).toEqual(
      expect.any(String),
    );

    const linkResponse = await getWorkspaceInvitationLink(invitation.id);

    expect(linkResponse.body.errors).toBeUndefined();
    expect(linkResponse.body.data.getWorkspaceInvitationLink).toBe(
      inviteLink.link,
    );
  });

  it('does not return the invitation link when an email provider is configured', async () => {
    const sendResponse = await sendInvitationsWithLinks(email);

    const [invitation] = sendResponse.body.data.sendInvitations.result;

    await updateConfigVariable({
      input: { key: 'EMAIL_DRIVER', value: 'SMTP' },
    });

    try {
      const linkResponse = await getWorkspaceInvitationLink(invitation.id);

      expect(linkResponse.body.data?.getWorkspaceInvitationLink).toBeFalsy();
      expect(linkResponse.body.errors[0].extensions.subCode).toBe(
        'FORBIDDEN_EXCEPTION',
      );
    } finally {
      await deleteConfigVariable({ input: { key: 'EMAIL_DRIVER' } });
    }
  });

  it('does not return the invitation link when email verification is required', async () => {
    await updateConfigVariable({
      input: { key: 'IS_EMAIL_VERIFICATION_REQUIRED', value: true },
    });

    try {
      const sendResponse = await sendInvitationsWithLinks(email);

      expect(sendResponse.body.errors).toBeUndefined();
      expect(sendResponse.body.data.sendInvitations.inviteLinks).toEqual([]);

      const [invitation] = sendResponse.body.data.sendInvitations.result;
      const linkResponse = await getWorkspaceInvitationLink(invitation.id);

      expect(linkResponse.body.data?.getWorkspaceInvitationLink).toBeFalsy();
      expect(linkResponse.body.errors[0].extensions.subCode).toBe(
        'FORBIDDEN_EXCEPTION',
      );
    } finally {
      await deleteConfigVariable({
        input: { key: 'IS_EMAIL_VERIFICATION_REQUIRED' },
      });
    }
  });

  it('keeps an account created through a shared link out of its other pending invitations', async () => {
    const ycombinatorAdminAccessToken = await getYcombinatorAdminAccessToken();
    let userAccessToken: string | undefined;

    try {
      const sendResponse = await sendInvitationsWithLinks(email);
      const [inviteLink] = sendResponse.body.data.sendInvitations.inviteLinks;
      const inviteToken = new URL(inviteLink.link).searchParams.get(
        'inviteToken',
      );

      assertIsDefinedOrThrow(inviteToken);

      const signUpResponse = await makeMetadataApiRequest(
        signUpInWorkspaceOperationFactory({
          email,
          password: PASSWORD,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          workspacePersonalInviteToken: inviteToken,
        }),
        null,
      );

      expect(signUpResponse.body.errors).toBeUndefined();

      const { data: authTokensData } = await getAuthTokensFromLoginToken({
        loginToken: signUpResponse.body.data.signUpInWorkspace.loginToken.token,
        origin: buildAppleWorkspaceOrigin(),
        expectToFail: false,
      });

      userAccessToken =
        authTokensData.getAuthTokensFromLoginToken.tokens
          .accessOrWorkspaceAgnosticToken.token;

      await sendInvitations({
        input: { emails: [email] },
        expectToFail: false,
        token: ycombinatorAdminAccessToken,
      });

      const loginResponse = await makeMetadataApiRequest(
        getLoginTokenFromCredentialsQueryFactory({
          email,
          password: PASSWORD,
          origin: buildWorkspaceOriginForSubdomain('yc'),
        }),
        null,
      );

      expect(loginResponse.body.data?.getLoginTokenFromCredentials).toBeFalsy();
      expect(loginResponse.body.errors[0].message).toBe(
        'Invitation link required to join the workspace',
      );
    } finally {
      await deleteWorkspaceInvitationsByEmail({
        email,
        workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
      });

      if (isDefined(userAccessToken)) {
        await deleteUser({ accessToken: userAccessToken, expectToFail: false });
      }
    }
  });
});
