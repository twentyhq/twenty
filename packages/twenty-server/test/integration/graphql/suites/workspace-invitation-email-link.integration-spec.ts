import { type SendMailOptions } from 'nodemailer';
import { sendInvitations } from 'test/integration/graphql/suites/user-session/utils/send-invitations.util';
import { clearInvitationSendingThrottle } from 'test/integration/graphql/utils/clear-invitation-sending-throttle.util';
import { findCurrentWorkspaceInviteHash } from 'test/integration/graphql/utils/find-current-workspace-invite-hash.util';
import {
  deleteWorkspaceInvitationsByEmail,
  findWorkspaceInvitationsByEmail,
} from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type EmailService } from 'src/engine/core-modules/email/email.service';

describe('sendInvitations email link (integration)', () => {
  it('links to the sign-in page with the personal invite token and without the workspace invite hash', async () => {
    const email = `invitation-email-link-${Date.now()}@example.com`;
    const sendEmailSpy = jest.spyOn(
      getAppProviderByClassName<EmailService>('EmailService'),
      'send',
    );

    try {
      const { data: workspaceData } = await findCurrentWorkspaceInviteHash({});
      const inviteHash = workspaceData.currentWorkspace.inviteHash;

      expect(inviteHash).toEqual(expect.any(String));

      const { data } = await sendInvitations({ input: { emails: [email] } });

      expect(data.sendInvitations.success).toBe(true);

      const [invitation] = await findWorkspaceInvitationsByEmail({ email });
      const sentEmail = sendEmailSpy.mock.calls
        .map(([sendMailOptions]) => sendMailOptions)
        .find(
          (sendMailOptions: SendMailOptions) => sendMailOptions.to === email,
        );

      expect(sentEmail?.text).toContain(
        `/welcome?inviteToken=${invitation.value}`,
      );
      expect(sentEmail?.text).not.toContain(inviteHash);
      expect(sentEmail?.html).not.toContain(inviteHash);
    } finally {
      sendEmailSpy.mockRestore();
      await deleteWorkspaceInvitationsByEmail({ email });
      await clearInvitationSendingThrottle({ email });
    }
  });
});
