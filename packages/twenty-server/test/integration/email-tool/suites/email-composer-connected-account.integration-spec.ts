import { ConnectedAccountOperation } from 'twenty-shared/types';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { EmailComposerService } from 'src/engine/core-modules/tool/tools/email-tool/email-composer.service';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const PHIL_USER_WORKSPACE_ID = '20202020-7169-42cf-bc47-1cfef15264b1';
const PHIL_CONNECTED_ACCOUNT_ID = '20202020-cafc-4323-908d-e5b42ad69fdf';
const PHIL_WORKSPACE_MEMBER_ID = '20202020-1553-45c6-a028-5a9064cce07f';

const JONY_CONNECTED_ACCOUNT_ID = '20202020-0cc8-4d60-a3a4-803245698908';

const TWENTY_APPLICATION_ID = '20202020-0000-4000-8000-000000000app';

const UNKNOWN_USER_WORKSPACE_ID = '20202020-0000-4000-8000-00000000dead';
const UNKNOWN_CONNECTED_ACCOUNT_ID = '20202020-0000-4000-8000-00000000beef';

const buildUserContext = (userWorkspaceId: string) => ({
  workspaceId: WORKSPACE_ID,
  authContext: {
    type: 'user',
    userWorkspaceId,
    workspace: { id: WORKSPACE_ID },
  } as unknown as WorkspaceAuthContext,
});

const buildAutomationContext = () => ({
  workspaceId: WORKSPACE_ID,
  authContext: {
    type: 'application',
    application: { id: TWENTY_APPLICATION_ID },
    workspace: { id: WORKSPACE_ID },
  } as unknown as WorkspaceAuthContext,
});

const baseParams = {
  recipients: { to: 'customer@example.com' },
  subject: 'Subject',
  body: '<p>body</p>',
  files: [],
};

const getFirstWorkspaceConnectedAccountId = async (): Promise<string> => {
  const [{ id }] = await global.testDataSource.query(
    `SELECT id FROM core."connectedAccount"
     WHERE "workspaceId" = $1 AND "archivedAt" IS NULL
       AND provider NOT IN ('app', 'oidc', 'saml')
     ORDER BY "createdAt" ASC, id ASC
     LIMIT 1`,
    [WORKSPACE_ID],
  );

  return id;
};

const readConnectedAccountState = async (
  connectedAccountId: string,
): Promise<{ visibility: string; archivedAt: string | null }> => {
  const [state] = await global.testDataSource.query(
    `SELECT visibility, "archivedAt" FROM core."connectedAccount" WHERE id = $1`,
    [connectedAccountId],
  );

  return state;
};

const setVisibility = async (
  connectedAccountId: string,
  visibility: string,
) => {
  await global.testDataSource.query(
    `UPDATE core."connectedAccount" SET visibility = $1 WHERE id = $2`,
    [visibility, connectedAccountId],
  );
};

const getWorkspaceSharedConnectedAccountIds = async (): Promise<string[]> => {
  const rows = await global.testDataSource.query(
    `SELECT id FROM core."connectedAccount"
     WHERE "workspaceId" = $1 AND visibility = 'workspace'`,
    [WORKSPACE_ID],
  );

  return rows.map((row: { id: string }) => row.id);
};

const insertConnectedAccount = async ({
  id,
  provider,
  userWorkspaceId,
  visibility = 'user',
}: {
  id: string;
  provider: 'app' | 'oidc' | 'saml' | 'email_group';
  userWorkspaceId: string;
  visibility?: 'user' | 'workspace';
}) => {
  await global.testDataSource.query(
    `INSERT INTO core."connectedAccount"
       (id, handle, provider, "userWorkspaceId", "workspaceId", visibility, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, '1970-01-01T00:00:00Z', now())`,
    [
      id,
      `${provider}@example.com`,
      provider,
      userWorkspaceId,
      WORKSPACE_ID,
      visibility,
    ],
  );
};

const insertNonMailboxConnectedAccount = async (params: {
  id: string;
  provider: 'app' | 'oidc' | 'saml';
  userWorkspaceId: string;
}) => insertConnectedAccount(params);

const deleteConnectedAccount = async (connectedAccountId: string) => {
  await global.testDataSource.query(
    `DELETE FROM core."connectedAccount" WHERE id = $1`,
    [connectedAccountId],
  );
};

const setArchivedAt = async (
  connectedAccountId: string,
  archivedAt: string | null,
) => {
  await global.testDataSource.query(
    `UPDATE core."connectedAccount" SET "archivedAt" = $1 WHERE id = $2`,
    [archivedAt, connectedAccountId],
  );
};

describe('EmailComposerService connected account resolution (integration)', () => {
  let service: EmailComposerService;

  beforeAll(() => {
    service = getAppProviderByClassName<EmailComposerService>(
      'EmailComposerService',
    );
  });

  describe('when the caller names a connected account', () => {
    it('uses a teammate account shared with the workspace', async () => {
      const { visibility } = await readConnectedAccountState(
        JONY_CONNECTED_ACCOUNT_ID,
      );

      await setVisibility(JONY_CONNECTED_ACCOUNT_ID, 'workspace');

      try {
        const result = await service.composeEmail({
          parameters: {
            ...baseParams,
            connectedAccountId: JONY_CONNECTED_ACCOUNT_ID,
          },
          context: buildUserContext(PHIL_USER_WORKSPACE_ID),
          operation: ConnectedAccountOperation.SEND_EMAIL,
        });

        expect(result.success).toBe(true);
        expect(result.success && result.data.connectedAccount.id).toBe(
          JONY_CONNECTED_ACCOUNT_ID,
        );
      } finally {
        await setVisibility(JONY_CONNECTED_ACCOUNT_ID, visibility);
      }
    });

    it('refuses a teammate private account', async () => {
      const { visibility } = await readConnectedAccountState(
        JONY_CONNECTED_ACCOUNT_ID,
      );

      await setVisibility(JONY_CONNECTED_ACCOUNT_ID, 'user');

      try {
        await expect(
          service.composeEmail({
            parameters: {
              ...baseParams,
              connectedAccountId: JONY_CONNECTED_ACCOUNT_ID,
            },
            context: buildUserContext(PHIL_USER_WORKSPACE_ID),
            operation: ConnectedAccountOperation.SEND_EMAIL,
          }),
        ).rejects.toThrow('is not usable by this caller');
      } finally {
        await setVisibility(JONY_CONNECTED_ACCOUNT_ID, visibility);
      }
    });

    it('uses that account for an automated run with nobody behind it', async () => {
      const result = await service.composeEmail({
        parameters: {
          ...baseParams,
          connectedAccountId: JONY_CONNECTED_ACCOUNT_ID,
        },
        context: buildAutomationContext(),
        operation: ConnectedAccountOperation.SEND_EMAIL,
      });

      expect(result.success).toBe(true);
      expect(result.success && result.data.connectedAccount.id).toBe(
        JONY_CONNECTED_ACCOUNT_ID,
      );
    });

    it('throws when the id is not a valid UUID', async () => {
      await expect(
        service.composeEmail({
          parameters: { ...baseParams, connectedAccountId: 'not-a-uuid' },
          context: buildUserContext(PHIL_USER_WORKSPACE_ID),
          operation: ConnectedAccountOperation.SEND_EMAIL,
        }),
      ).rejects.toThrow('Connected account id is not a valid UUID');
    });

    it('throws when no connected account matches the id', async () => {
      await expect(
        service.composeEmail({
          parameters: {
            ...baseParams,
            connectedAccountId: UNKNOWN_CONNECTED_ACCOUNT_ID,
          },
          context: buildUserContext(PHIL_USER_WORKSPACE_ID),
          operation: ConnectedAccountOperation.SEND_EMAIL,
        }),
      ).rejects.toThrow('No connected account found for id');
    });

    it('refuses an application connection that cannot carry mail', async () => {
      const appConnectedAccountId = '20202020-0000-4000-8000-0000000000a1';

      await insertNonMailboxConnectedAccount({
        id: appConnectedAccountId,
        provider: 'app',
        userWorkspaceId: PHIL_USER_WORKSPACE_ID,
      });

      try {
        await expect(
          service.composeEmail({
            parameters: {
              ...baseParams,
              connectedAccountId: appConnectedAccountId,
            },
            context: buildUserContext(PHIL_USER_WORKSPACE_ID),
            operation: ConnectedAccountOperation.SEND_EMAIL,
          }),
        ).rejects.toThrow('cannot perform SEND_EMAIL');
      } finally {
        await deleteConnectedAccount(appConnectedAccountId);
      }
    });

    it('refuses an archived account named explicitly', async () => {
      const { archivedAt } = await readConnectedAccountState(
        JONY_CONNECTED_ACCOUNT_ID,
      );

      await setArchivedAt(JONY_CONNECTED_ACCOUNT_ID, new Date().toISOString());

      try {
        await expect(
          service.composeEmail({
            parameters: {
              ...baseParams,
              connectedAccountId: JONY_CONNECTED_ACCOUNT_ID,
            },
            context: buildAutomationContext(),
            operation: ConnectedAccountOperation.SEND_EMAIL,
          }),
        ).rejects.toThrow('No connected account found for id');
      } finally {
        await setArchivedAt(JONY_CONNECTED_ACCOUNT_ID, archivedAt);
      }
    });
  });

  describe('when the caller names a workspace member', () => {
    it("sends from the member's own mailbox in a workflow run", async () => {
      const result = await service.composeEmail({
        parameters: {
          ...baseParams,
          connectedAccountId: PHIL_WORKSPACE_MEMBER_ID,
        },
        context: buildAutomationContext(),
        operation: ConnectedAccountOperation.SEND_EMAIL,
      });

      expect(result.success).toBe(true);
      expect(result.success && result.data.connectedAccount.id).toBe(
        PHIL_CONNECTED_ACCOUNT_ID,
      );
    });

    it("refuses a teammate's private mailbox named through the member", async () => {
      await expect(
        service.composeEmail({
          parameters: {
            ...baseParams,
            connectedAccountId: PHIL_WORKSPACE_MEMBER_ID,
          },
          context: buildUserContext(UNKNOWN_USER_WORKSPACE_ID),
          operation: ConnectedAccountOperation.SEND_EMAIL,
        }),
      ).rejects.toThrow('is not usable by this caller');
    });

    it('throws when the member has no mailbox that can send', async () => {
      const { archivedAt } = await readConnectedAccountState(
        PHIL_CONNECTED_ACCOUNT_ID,
      );

      await setArchivedAt(PHIL_CONNECTED_ACCOUNT_ID, new Date().toISOString());

      try {
        await expect(
          service.composeEmail({
            parameters: {
              ...baseParams,
              connectedAccountId: PHIL_WORKSPACE_MEMBER_ID,
            },
            context: buildAutomationContext(),
            operation: ConnectedAccountOperation.SEND_EMAIL,
          }),
        ).rejects.toThrow(
          `Workspace member '${PHIL_WORKSPACE_MEMBER_ID}' has no connected account that can perform SEND_EMAIL`,
        );
      } finally {
        await setArchivedAt(PHIL_CONNECTED_ACCOUNT_ID, archivedAt);
      }
    });
  });

  describe('when drafting rather than sending', () => {
    it('composes a draft from the caller own mailbox', async () => {
      const result = await service.composeEmail({
        parameters: baseParams,
        context: buildUserContext(PHIL_USER_WORKSPACE_ID),
        operation: ConnectedAccountOperation.DRAFT_EMAIL,
      });

      expect(result.success).toBe(true);
      expect(result.success && result.data.connectedAccount.id).toBe(
        PHIL_CONNECTED_ACCOUNT_ID,
      );
    });

    it('refuses an email group, which has no drafts folder', async () => {
      const emailGroupConnectedAccountId =
        '20202020-0000-4000-8000-0000000000a4';

      await insertConnectedAccount({
        id: emailGroupConnectedAccountId,
        provider: 'email_group',
        userWorkspaceId: PHIL_USER_WORKSPACE_ID,
        visibility: 'workspace',
      });

      try {
        await expect(
          service.composeEmail({
            parameters: {
              ...baseParams,
              connectedAccountId: emailGroupConnectedAccountId,
            },
            context: buildAutomationContext(),
            operation: ConnectedAccountOperation.DRAFT_EMAIL,
          }),
        ).rejects.toThrow('cannot perform DRAFT_EMAIL');
      } finally {
        await deleteConnectedAccount(emailGroupConnectedAccountId);
      }
    });
  });

  describe('when the caller names none', () => {
    it('composes from the caller own account rather than the first of the workspace', async () => {
      const result = await service.composeEmail({
        parameters: baseParams,
        context: buildUserContext(PHIL_USER_WORKSPACE_ID),
        operation: ConnectedAccountOperation.SEND_EMAIL,
      });

      expect(result.success).toBe(true);
      expect(result.success && result.data.connectedAccount.id).toBe(
        PHIL_CONNECTED_ACCOUNT_ID,
      );
    });

    it('skips an older application connection and still picks the mailbox', async () => {
      const appConnectedAccountId = '20202020-0000-4000-8000-0000000000a2';

      await insertNonMailboxConnectedAccount({
        id: appConnectedAccountId,
        provider: 'app',
        userWorkspaceId: PHIL_USER_WORKSPACE_ID,
      });

      try {
        const result = await service.composeEmail({
          parameters: baseParams,
          context: buildUserContext(PHIL_USER_WORKSPACE_ID),
          operation: ConnectedAccountOperation.SEND_EMAIL,
        });

        expect(result.success).toBe(true);
        expect(result.success && result.data.connectedAccount.id).toBe(
          PHIL_CONNECTED_ACCOUNT_ID,
        );
      } finally {
        await deleteConnectedAccount(appConnectedAccountId);
      }
    });

    it('skips an older SSO connection when there is no caller (workflow run)', async () => {
      const oidcConnectedAccountId = '20202020-0000-4000-8000-0000000000a3';

      await insertNonMailboxConnectedAccount({
        id: oidcConnectedAccountId,
        provider: 'oidc',
        userWorkspaceId: PHIL_USER_WORKSPACE_ID,
      });

      try {
        const firstWorkspaceConnectedAccountId =
          await getFirstWorkspaceConnectedAccountId();

        const result = await service.composeEmail({
          parameters: baseParams,
          context: buildAutomationContext(),
          operation: ConnectedAccountOperation.SEND_EMAIL,
        });

        expect(result.success).toBe(true);
        expect(result.success && result.data.connectedAccount.id).toBe(
          firstWorkspaceConnectedAccountId,
        );
        expect(result.success && result.data.connectedAccount.id).not.toBe(
          oidcConnectedAccountId,
        );
      } finally {
        await deleteConnectedAccount(oidcConnectedAccountId);
      }
    });

    it('falls back to an account shared with the whole workspace', async () => {
      const { visibility } = await readConnectedAccountState(
        JONY_CONNECTED_ACCOUNT_ID,
      );

      await setVisibility(JONY_CONNECTED_ACCOUNT_ID, 'workspace');

      try {
        const result = await service.composeEmail({
          parameters: baseParams,
          context: buildUserContext(UNKNOWN_USER_WORKSPACE_ID),
          operation: ConnectedAccountOperation.SEND_EMAIL,
        });

        expect(result.success).toBe(true);
        expect(result.success && result.data.connectedAccount.id).toBe(
          JONY_CONNECTED_ACCOUNT_ID,
        );
      } finally {
        await setVisibility(JONY_CONNECTED_ACCOUNT_ID, visibility);
      }
    });

    it('throws rather than composing from a colleague account', async () => {
      const sharedConnectedAccountIds =
        await getWorkspaceSharedConnectedAccountIds();

      for (const connectedAccountId of sharedConnectedAccountIds) {
        await setVisibility(connectedAccountId, 'user');
      }

      try {
        await expect(
          service.composeEmail({
            parameters: baseParams,
            context: buildUserContext(UNKNOWN_USER_WORKSPACE_ID),
            operation: ConnectedAccountOperation.SEND_EMAIL,
          }),
        ).rejects.toThrow('No connected account available to this caller');
      } finally {
        for (const connectedAccountId of sharedConnectedAccountIds) {
          await setVisibility(connectedAccountId, 'workspace');
        }
      }
    });

    it('takes the first workspace account when there is no caller (workflow run)', async () => {
      const firstWorkspaceConnectedAccountId =
        await getFirstWorkspaceConnectedAccountId();

      const result = await service.composeEmail({
        parameters: baseParams,
        context: buildAutomationContext(),
        operation: ConnectedAccountOperation.SEND_EMAIL,
      });

      expect(result.success).toBe(true);
      expect(result.success && result.data.connectedAccount.id).toBe(
        firstWorkspaceConnectedAccountId,
      );
    });
  });
});
