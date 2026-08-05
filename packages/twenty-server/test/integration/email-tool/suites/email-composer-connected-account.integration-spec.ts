import { EmailComposerService } from 'src/engine/core-modules/tool/tools/email-tool/email-composer.service';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const PHIL_USER_WORKSPACE_ID = '20202020-7169-42cf-bc47-1cfef15264b1';
const PHIL_CONNECTED_ACCOUNT_ID = '20202020-cafc-4323-908d-e5b42ad69fdf';

const JONY_USER_WORKSPACE_ID = '20202020-3957-4908-9c36-2929a23f8353';
const JONY_CONNECTED_ACCOUNT_ID = '20202020-0cc8-4d60-a3a4-803245698908';

const UNKNOWN_USER_WORKSPACE_ID = '20202020-0000-4000-8000-00000000dead';
const UNKNOWN_CONNECTED_ACCOUNT_ID = '20202020-0000-4000-8000-00000000beef';

const baseParams = {
  recipients: { to: 'customer@example.com' },
  subject: 'Subject',
  body: '<p>body</p>',
  files: [],
};

const setVisibility = async (
  connectedAccountId: string,
  visibility: 'user' | 'workspace',
) => {
  await global.testDataSource.query(
    `UPDATE core."connectedAccount" SET visibility = $1 WHERE id = $2`,
    [visibility, connectedAccountId],
  );
};

describe('EmailComposerService connected account resolution (integration)', () => {
  let service: EmailComposerService;

  beforeAll(() => {
    service =
      getAppProviderByClassName<EmailComposerService>('EmailComposerService');
  });

  describe('when the caller names a connected account', () => {
    it('uses that account, whoever owns it', async () => {
      const result = await service.composeEmail(
        { ...baseParams, connectedAccountId: JONY_CONNECTED_ACCOUNT_ID },
        { workspaceId: WORKSPACE_ID, userWorkspaceId: PHIL_USER_WORKSPACE_ID },
      );

      expect(result.success).toBe(true);
      expect(result.success && result.data.connectedAccount.id).toBe(
        JONY_CONNECTED_ACCOUNT_ID,
      );
    });

    it('uses that account when there is no caller (workflow run)', async () => {
      const result = await service.composeEmail(
        { ...baseParams, connectedAccountId: JONY_CONNECTED_ACCOUNT_ID },
        { workspaceId: WORKSPACE_ID },
      );

      expect(result.success).toBe(true);
      expect(result.success && result.data.connectedAccount.id).toBe(
        JONY_CONNECTED_ACCOUNT_ID,
      );
    });

    it('throws when the id is not a valid UUID', async () => {
      await expect(
        service.composeEmail(
          { ...baseParams, connectedAccountId: 'not-a-uuid' },
          { workspaceId: WORKSPACE_ID, userWorkspaceId: PHIL_USER_WORKSPACE_ID },
        ),
      ).rejects.toThrow('Connected account id is not a valid UUID');
    });

    it('throws when no connected account matches the id', async () => {
      await expect(
        service.composeEmail(
          { ...baseParams, connectedAccountId: UNKNOWN_CONNECTED_ACCOUNT_ID },
          { workspaceId: WORKSPACE_ID, userWorkspaceId: PHIL_USER_WORKSPACE_ID },
        ),
      ).rejects.toThrow('No connected account found for id');
    });
  });

  describe('when the caller names none', () => {
    it('composes from the caller own account rather than the first of the workspace', async () => {
      const result = await service.composeEmail(baseParams, {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: PHIL_USER_WORKSPACE_ID,
      });

      expect(result.success).toBe(true);
      expect(result.success && result.data.connectedAccount.id).toBe(
        PHIL_CONNECTED_ACCOUNT_ID,
      );
    });

    it('falls back to an account shared with the whole workspace', async () => {
      await setVisibility(JONY_CONNECTED_ACCOUNT_ID, 'workspace');

      try {
        const result = await service.composeEmail(baseParams, {
          workspaceId: WORKSPACE_ID,
          userWorkspaceId: UNKNOWN_USER_WORKSPACE_ID,
        });

        expect(result.success).toBe(true);
        expect(result.success && result.data.connectedAccount.id).toBe(
          JONY_CONNECTED_ACCOUNT_ID,
        );
      } finally {
        await setVisibility(JONY_CONNECTED_ACCOUNT_ID, 'user');
      }
    });

    it('throws rather than composing from a colleague account', async () => {
      await expect(
        service.composeEmail(baseParams, {
          workspaceId: WORKSPACE_ID,
          userWorkspaceId: UNKNOWN_USER_WORKSPACE_ID,
        }),
      ).rejects.toThrow('No connected account available for user workspace');
    });

    it('takes the first workspace account when there is no caller (workflow run)', async () => {
      const result = await service.composeEmail(baseParams, {
        workspaceId: WORKSPACE_ID,
      });

      expect(result.success).toBe(true);
      expect(result.success && result.data.connectedAccount.id).toBe(
        JONY_CONNECTED_ACCOUNT_ID,
      );
    });
  });
});
