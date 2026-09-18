import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const WORKER_ID = 'worker-user-workspace-id';
const PUBLIC_READER_ID = 'public-reader-user-workspace-id';

// A public channel is readable by the whole workspace, so the reader set and
// the worker set differ: only the worker predicate names somebody who joined.
const buildService = ({
  deletedAt = null,
}: { deletedAt?: Date | null } = {}) => {
  const thread = {
    id: THREAD_ID,
    title: 'Before',
    deletedAt,
  };

  const threadRepository = {
    findOne: jest.fn().mockImplementation((_workspaceId, { where }) => {
      const worksThread = where.some(
        (clause: Record<string, unknown>) =>
          clause.userWorkspaceId === WORKER_ID ||
          clause.assigneeUserWorkspaceId === WORKER_ID,
      );

      return Promise.resolve(worksThread ? thread : null);
    }),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const service = Object.create(AgentChatService.prototype) as AgentChatService;

  Object.assign(service, {
    threadRepository,
    findThreadById: jest.fn().mockResolvedValue(thread),
    broadcastThreadUpdated: jest.fn().mockResolvedValue(undefined),
  });

  return { service, threadRepository, thread };
};

describe('AgentChatService worker-gated writes', () => {
  describe('updateThreadTitle', () => {
    const rename = (service: AgentChatService, userWorkspaceId: string) =>
      service.updateThreadTitle({
        threadId: THREAD_ID,
        userWorkspaceId,
        workspaceId: WORKSPACE_ID,
        title: 'After',
      });

    it('lets somebody working the thread rename it', async () => {
      const { service, threadRepository } = buildService();

      await rename(service, WORKER_ID);

      expect(threadRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: THREAD_ID },
        { title: 'After' },
      );
    });

    it('refuses a reader who only sees the thread through a public channel', async () => {
      const { service, threadRepository } = buildService();

      await expect(rename(service, PUBLIC_READER_ID)).rejects.toMatchObject({
        code: AiExceptionCode.THREAD_NOT_JOINED,
      });
      expect(threadRepository.update).not.toHaveBeenCalled();
    });

    it('refuses an empty title before looking at who is asking', async () => {
      const { service, threadRepository } = buildService();

      await expect(
        service.updateThreadTitle({
          threadId: THREAD_ID,
          userWorkspaceId: WORKER_ID,
          workspaceId: WORKSPACE_ID,
          title: '   ',
        }),
      ).rejects.toMatchObject({
        code: AiExceptionCode.INVALID_CHAT_THREAD_TITLE,
      });
      expect(threadRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('unarchiveThread', () => {
    const unarchive = (service: AgentChatService, userWorkspaceId: string) =>
      service.unarchiveThread({
        threadId: THREAD_ID,
        userWorkspaceId,
        workspaceId: WORKSPACE_ID,
      });

    it('lets somebody working the thread bring it back', async () => {
      const { service, threadRepository } = buildService({
        deletedAt: new Date(),
      });

      await unarchive(service, WORKER_ID);

      expect(threadRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ id: THREAD_ID }),
        { deletedAt: null },
      );
    });

    it('refuses a reader who only sees the thread through a public channel', async () => {
      const { service, threadRepository } = buildService({
        deletedAt: new Date(),
      });

      await expect(unarchive(service, PUBLIC_READER_ID)).rejects.toMatchObject({
        code: AiExceptionCode.THREAD_NOT_JOINED,
      });
      expect(threadRepository.update).not.toHaveBeenCalled();
    });

    // Writing into an archived thread brings it back, and the send path has
    // already checked the writer, so this one stays open to every reader who
    // may send.
    it('brings the thread back for a sender without the worker gate', async () => {
      const { service, threadRepository } = buildService({
        deletedAt: new Date(),
      });

      await service.restoreArchivedThread({
        threadId: THREAD_ID,
        userWorkspaceId: PUBLIC_READER_ID,
        workspaceId: WORKSPACE_ID,
      });

      expect(threadRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ id: THREAD_ID }),
        { deletedAt: null },
      );
    });
  });
});
