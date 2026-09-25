import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const USER_WORKSPACE_ID = '20202020-0000-4000-8000-000000000002';
const RECORD_ID = '20202020-0000-4000-8000-000000000003';
const OLDER_THREAD_ID = '20202020-0000-4000-8000-000000000004';
const NEWER_THREAD_ID = '20202020-0000-4000-8000-000000000005';
const READABLE_THREAD_IDS = [OLDER_THREAD_ID, NEWER_THREAD_ID];
const NEWER_THREAD_LAST_MESSAGE_AT = new Date('2026-09-24T12:00:00.000Z');

const buildService = ({
  storage = 'workspace',
}: { storage?: 'workspace' | 'core' } = {}) => {
  // The query ranks the newer thread first; the rows are read back the other
  // way round, so only the ranking can put them in order.
  const rankedThreadsQuery = jest.fn().mockResolvedValue([
    { id: NEWER_THREAD_ID, last_message_at: NEWER_THREAD_LAST_MESSAGE_AT },
    { id: OLDER_THREAD_ID, last_message_at: null },
  ]);

  const threadRepository = {
    query: jest
      .fn()
      .mockImplementation(
        (
          _workspaceId: string,
          work: (context: {
            manager: { query: jest.Mock };
            table: (name: string) => string;
            storage: 'workspace' | 'core';
          }) => Promise<unknown>,
        ) =>
          work({
            manager: { query: rankedThreadsQuery },
            table: (name) => `"history"."${name}"`,
            storage,
          }),
      ),
    find: jest.fn().mockResolvedValue([
      { id: OLDER_THREAD_ID, title: 'Older' },
      { id: NEWER_THREAD_ID, title: 'Newer' },
    ]),
  };

  const service = new AgentChatService(
    threadRepository as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {
      getReadableThreadIds: jest.fn().mockResolvedValue(READABLE_THREAD_IDS),
    } as never,
  );

  return { service, rankedThreadsQuery, threadRepository };
};

const listThreadsAttachedToCompany = (service: AgentChatService) =>
  service.getThreadsAttachedToRecord({
    joinColumnName: 'targetCompanyId',
    recordId: RECORD_ID,
    userWorkspaceId: USER_WORKSPACE_ID,
    workspaceId: WORKSPACE_ID,
    limit: 20,
    offset: 40,
  });

describe('Listing the conversations attached to a record', () => {
  it('pages the readable conversations that link the record, in one query', async () => {
    const { service, rankedThreadsQuery } = buildService();

    await listThreadsAttachedToCompany(service);

    const [sql, parameters] = rankedThreadsQuery.mock.calls[0];

    expect(parameters).toEqual([READABLE_THREAD_IDS, RECORD_ID, 20, 40]);
    expect(sql).toContain('thread.id = ANY($1::uuid[])');
    expect(sql).toContain(
      `FROM "${getWorkspaceSchemaName(WORKSPACE_ID)}"."agentChatThreadTarget" target`,
    );
    expect(sql).toContain('target."targetCompanyId" = $2');
    expect(sql).toContain('target."deletedAt" IS NULL');
    // The id breaks ranking ties, so pages cannot repeat or skip a thread.
    expect(sql).toMatch(/thread\.id DESC LIMIT \$3 OFFSET \$4$/);
  });

  it('returns the conversations in ranked order', async () => {
    const { service } = buildService();

    await expect(listThreadsAttachedToCompany(service)).resolves.toEqual([
      expect.objectContaining({
        id: NEWER_THREAD_ID,
        lastMessageAt: NEWER_THREAD_LAST_MESSAGE_AT,
      }),
      expect.objectContaining({ id: OLDER_THREAD_ID, lastMessageAt: null }),
    ]);
  });

  // Links live in the workspace schema, so a workspace whose history still
  // routes to core has none to match.
  it('returns an empty page while history routes to core', async () => {
    const { service, rankedThreadsQuery, threadRepository } = buildService({
      storage: 'core',
    });

    await expect(listThreadsAttachedToCompany(service)).resolves.toEqual([]);

    expect(rankedThreadsQuery).not.toHaveBeenCalled();
    expect(threadRepository.find).not.toHaveBeenCalled();
  });

  it('leaves the chat list unscoped and unpaged', async () => {
    const { service, rankedThreadsQuery } = buildService();

    await service.getThreadsForUser({
      userWorkspaceId: USER_WORKSPACE_ID,
      workspaceId: WORKSPACE_ID,
    });

    const [sql, parameters] = rankedThreadsQuery.mock.calls[0];

    expect(parameters).toEqual([READABLE_THREAD_IDS]);
    expect(sql).not.toContain('agentChatThreadTarget');
    expect(sql).not.toContain('LIMIT');
  });
});
