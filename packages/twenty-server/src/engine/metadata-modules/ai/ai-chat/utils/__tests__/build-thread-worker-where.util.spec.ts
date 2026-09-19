import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';
import { buildThreadAccessWhere } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-thread-access-where.util';
import { buildThreadWorkerWhere } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-thread-worker-where.util';

const USER_WORKSPACE_ID = 'user-workspace-id';

describe('buildThreadWorkerWhere', () => {
  it('does not let a public channel alone make somebody a worker', () => {
    const workerClauses = buildThreadWorkerWhere({
      id: 'thread-id',
      userWorkspaceId: USER_WORKSPACE_ID,
    });

    expect(workerClauses).not.toContainEqual({
      id: 'thread-id',
      channel: { visibility: AgentChatChannelVisibility.PUBLIC },
    });
    expect(
      buildThreadAccessWhere({
        id: 'thread-id',
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toContainEqual(
      expect.objectContaining({
        channel: { visibility: AgentChatChannelVisibility.PUBLIC },
      }),
    );
  });

  it('never authorizes an assignee on what they cannot read', () => {
    const assigneeClauses = buildThreadWorkerWhere({
      id: 'thread-id',
      userWorkspaceId: USER_WORKSPACE_ID,
    }).filter((clause) => clause.assigneeUserWorkspaceId === USER_WORKSPACE_ID);

    expect(assigneeClauses).toEqual([
      {
        id: 'thread-id',
        assigneeUserWorkspaceId: USER_WORKSPACE_ID,
        channel: { visibility: AgentChatChannelVisibility.PUBLIC },
      },
    ]);
  });

  it('counts the owner, the participants, the channel and a public-channel assignee', () => {
    expect(
      buildThreadWorkerWhere({
        id: 'thread-id',
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    ).toEqual([
      { id: 'thread-id', userWorkspaceId: USER_WORKSPACE_ID },
      {
        id: 'thread-id',
        participants: { userWorkspaceId: USER_WORKSPACE_ID },
      },
      {
        id: 'thread-id',
        channel: { members: { userWorkspaceId: USER_WORKSPACE_ID } },
      },
      {
        id: 'thread-id',
        channel: {
          roles: {
            role: { roleTargets: { userWorkspaceId: USER_WORKSPACE_ID } },
          },
        },
      },
      {
        id: 'thread-id',
        assigneeUserWorkspaceId: USER_WORKSPACE_ID,
        channel: { visibility: AgentChatChannelVisibility.PUBLIC },
      },
    ]);
  });

  it('carries the rest of the predicate into every clause', () => {
    for (const clause of buildThreadWorkerWhere({
      id: 'thread-id',
      userWorkspaceId: USER_WORKSPACE_ID,
    })) {
      expect(clause).toMatchObject({ id: 'thread-id' });
    }
  });
});
