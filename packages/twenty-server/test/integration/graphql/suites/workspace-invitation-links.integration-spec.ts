import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { deleteWorkspaceInvitationsByEmail } from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';

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

  it('returns the invitation link when no email provider is configured', async () => {
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
});
