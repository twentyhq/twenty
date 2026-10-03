import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { findTurnIdsActedByOthers } from 'src/engine/metadata-modules/ai/ai-history/utils/find-turn-ids-acted-by-others.util';

const APPLICATION_ID = 'application-id';

const userMessage = (
  turnId: string | null,
  senderUserWorkspaceId: string | null,
) => ({
  turnId,
  role: AgentMessageRole.USER,
  senderUserWorkspaceId,
  senderApplicationId: APPLICATION_ID,
});

const assistantMessage = (turnId: string | null) => ({
  turnId,
  role: AgentMessageRole.ASSISTANT,
  senderUserWorkspaceId: null,
  senderApplicationId: null,
});

describe('findTurnIdsActedByOthers', () => {
  it('should keep the turns a member sent and flag the others', () => {
    expect(
      findTurnIdsActedByOthers({
        messages: [
          userMessage('turn-1', 'member-a'),
          assistantMessage('turn-1'),
          userMessage('turn-2', 'member-b'),
          assistantMessage('turn-2'),
          userMessage('turn-3', null),
          assistantMessage('turn-3'),
        ],
        actor: { type: 'user', userWorkspaceId: 'member-a' },
      }),
    ).toEqual(new Set(['turn-2', 'turn-3']));
  });

  it('should keep the turns the application sent on its own', () => {
    expect(
      findTurnIdsActedByOthers({
        messages: [
          userMessage('turn-1', 'member-a'),
          userMessage('turn-2', null),
        ],
        actor: { type: 'application', applicationId: APPLICATION_ID },
      }),
    ).toEqual(new Set(['turn-1']));
  });

  it('should flag turns with no request or a request from someone else', () => {
    expect(
      findTurnIdsActedByOthers({
        messages: [
          assistantMessage('turn-1'),
          userMessage('turn-2', 'member-a'),
          userMessage('turn-2', 'member-b'),
        ],
        actor: { type: 'user', userWorkspaceId: 'member-a' },
      }),
    ).toEqual(new Set(['turn-1', 'turn-2']));
  });
});
