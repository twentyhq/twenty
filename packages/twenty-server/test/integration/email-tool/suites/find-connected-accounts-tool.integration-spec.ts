import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FindConnectedAccountsTool } from 'src/engine/core-modules/tool/tools/email-tool/find-connected-accounts-tool';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const PHIL_USER_WORKSPACE_ID = '20202020-7169-42cf-bc47-1cfef15264b1';
const PHIL_CONNECTED_ACCOUNT_ID = '20202020-cafc-4323-908d-e5b42ad69fdf';

const JONY_CONNECTED_ACCOUNT_ID = '20202020-0cc8-4d60-a3a4-803245698908';

const philContext = {
  workspaceId: WORKSPACE_ID,
  authContext: {
    type: 'user',
    userWorkspaceId: PHIL_USER_WORKSPACE_ID,
    workspace: { id: WORKSPACE_ID },
  } as unknown as WorkspaceAuthContext,
};

const apiKeyContext = {
  workspaceId: WORKSPACE_ID,
  authContext: {
    type: 'apiKey',
    workspace: { id: WORKSPACE_ID },
  } as unknown as WorkspaceAuthContext,
};

const readVisibility = async (connectedAccountId: string): Promise<string> => {
  const [{ visibility }] = await global.testDataSource.query(
    `SELECT visibility FROM core."connectedAccount" WHERE id = $1`,
    [connectedAccountId],
  );

  return visibility;
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

const findAccountIds = async (
  tool: FindConnectedAccountsTool,
  context: typeof philContext,
): Promise<string[]> => {
  const output = await tool.execute({}, context);

  return (output.result as { records: { id: string }[] }).records.map(
    (record) => record.id,
  );
};

describe('FindConnectedAccountsTool visibility (integration)', () => {
  let tool: FindConnectedAccountsTool;
  let jonyVisibility: string;
  let philVisibility: string;

  beforeAll(async () => {
    tool = getAppProviderByClassName<FindConnectedAccountsTool>(
      'FindConnectedAccountsTool',
    );
    jonyVisibility = await readVisibility(JONY_CONNECTED_ACCOUNT_ID);
    philVisibility = await readVisibility(PHIL_CONNECTED_ACCOUNT_ID);
    await setVisibility(PHIL_CONNECTED_ACCOUNT_ID, 'user');
  });

  afterEach(async () => {
    await setVisibility(JONY_CONNECTED_ACCOUNT_ID, jonyVisibility);
  });

  afterAll(async () => {
    await setVisibility(PHIL_CONNECTED_ACCOUNT_ID, philVisibility);
  });

  it("shows a user their own mailbox but not a teammate's private one", async () => {
    await setVisibility(JONY_CONNECTED_ACCOUNT_ID, 'user');

    const accountIds = await findAccountIds(tool, philContext);

    expect(accountIds).toContain(PHIL_CONNECTED_ACCOUNT_ID);
    expect(accountIds).not.toContain(JONY_CONNECTED_ACCOUNT_ID);
  });

  it('shows an api key only the mailboxes shared with the workspace', async () => {
    await setVisibility(JONY_CONNECTED_ACCOUNT_ID, 'workspace');

    const accountIds = await findAccountIds(tool, apiKeyContext);

    expect(accountIds).toContain(JONY_CONNECTED_ACCOUNT_ID);
    expect(accountIds).not.toContain(PHIL_CONNECTED_ACCOUNT_ID);
  });

  it('refuses a call that carries no caller identity', async () => {
    await expect(
      tool.execute({}, { workspaceId: WORKSPACE_ID }),
    ).rejects.toThrow(
      'An auth context is required to resolve the connected account',
    );
  });
});
