import { QueryFailedError } from 'typeorm';

import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { buildInboxThreadId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-thread-id.util';

const SENDER = {
  type: 'workflow' as const,
  workflowId: 'workflow-id',
  workflowName: 'New deals',
};

const OPEN_ARGS = {
  workspaceId: 'workspace-id',
  sender: SENDER,
  threadKey: 'run-id',
  title: 'Draft the quote',
};

const buildUniqueViolation = () =>
  Object.assign(new QueryFailedError('INSERT', [], new Error('duplicate')), {
    code: '23505',
  });

const buildService = () => {
  const threadRepository = {
    findOne: jest.fn().mockResolvedValue(null),
  };
  const threadService = {
    createThread: jest
      .fn()
      .mockImplementation(({ id, workspaceMemberId }) =>
        Promise.resolve({ id, workspaceMemberId }),
      ),
  };

  const service = new AgentInboxService(
    threadRepository as never,
    {} as never,
    {} as never,
    threadService as never,
    {} as never,
    {} as never,
  );

  return { service, threadRepository, threadService };
};

describe('AgentInboxService.openThread', () => {
  it('continues the conversation the sender already has with the member under that key', async () => {
    const { service, threadRepository, threadService } = buildService();
    const existingThread = { id: 'existing-thread-id' };

    threadRepository.findOne.mockResolvedValue(existingThread);

    await expect(
      service.openThread({ ...OPEN_ARGS, workspaceMemberId: 'member-id' }),
    ).resolves.toEqual({ thread: existingThread, isCreated: false });
    expect(threadService.createThread).not.toHaveBeenCalled();
  });

  it("creates the member's conversation under an id derived from the sender, member and key", async () => {
    const { service, threadService } = buildService();

    const { thread, isCreated } = await service.openThread({
      ...OPEN_ARGS,
      workspaceMemberId: 'member-id',
      isArchivedOnCreate: true,
    });

    expect(isCreated).toBe(true);
    expect(thread.id).toBe(
      buildInboxThreadId({
        senderKey: 'workflow:workflow-id',
        workspaceMemberId: 'member-id',
        threadKey: 'run-id',
      }),
    );
    expect(threadService.createThread).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      workspaceMemberId: 'member-id',
      id: thread.id,
      title: 'Draft the quote',
      isArchived: true,
    });
  });

  it('keeps a conversation with no member out of every inbox', async () => {
    const { service, threadService } = buildService();

    const { thread, isCreated } = await service.openThread({
      ...OPEN_ARGS,
      workspaceMemberId: null,
    });

    expect(isCreated).toBe(true);
    expect(threadService.createThread).toHaveBeenCalledWith(
      expect.objectContaining({ workspaceMemberId: null, id: thread.id }),
    );
    expect(thread.id).not.toBe(
      buildInboxThreadId({
        senderKey: 'workflow:workflow-id',
        workspaceMemberId: 'member-id',
        threadKey: 'run-id',
      }),
    );
  });

  it('returns the conversation a concurrent open created first', async () => {
    const { service, threadRepository, threadService } = buildService();
    const concurrentThread = { id: 'concurrent-thread-id' };

    threadService.createThread.mockRejectedValue(buildUniqueViolation());
    threadRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(concurrentThread);

    await expect(
      service.openThread({ ...OPEN_ARGS, workspaceMemberId: 'member-id' }),
    ).resolves.toEqual({ thread: concurrentThread, isCreated: false });
  });
});
