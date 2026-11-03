import { FieldActorSource } from 'twenty-shared/types';

import { getAgentChatThreadRowMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-row-metadata.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

type Projection = Parameters<typeof getAgentChatThreadRowMetadata>[0];

const THREAD: Projection['thread'] = {
  id: 'thread',
  lastActivityAt: '2026-11-03T10:02:00.000Z',
  pendingQuestionMessageId: null,
};
const MESSAGE: NonNullable<Projection['message']> = {
  id: 'message',
  turnId: 'turn',
  role: AgentMessageRole.ASSISTANT,
  senderWorkspaceMemberId: null,
  senderApplicationId: null,
  createdAt: '2026-11-03T10:01:00.000Z',
  processedAt: '2026-11-03T10:01:00.000Z',
};
const TURN: NonNullable<Projection['latestTurn']> = {
  id: 'turn',
  agentId: null,
  modelId: 'model',
  status: AgentTurnStatus.COMPLETED,
  error: null,
  createdAt: '2026-11-03T10:00:00.000Z',
  endedAt: '2026-11-03T10:01:00.000Z',
  createdBy: {
    source: FieldActorSource.MANUAL,
    workspaceMemberId: 'member',
    name: 'Jane',
    context: {},
  },
};

const project = (overrides: Partial<Projection> = {}) =>
  getAgentChatThreadRowMetadata({
    thread: THREAD,
    message: MESSAGE,
    messageTurn: TURN,
    latestTurn: TURN,
    ...overrides,
  });

describe('getAgentChatThreadRowMetadata', () => {
  it('labels successful assistant execution using the persisted matching turn', () => {
    expect(project()).toMatchObject({
      senderType: 'assistant',
      executionOutcome: 'finished',
    });
  });

  it.each([AgentTurnStatus.RUNNING, AgentTurnStatus.WAITING_FOR_INPUT])(
    'does not label an unfinished %s turn as Finished',
    (status) => {
      expect(
        project({ latestTurn: { ...TURN, status, endedAt: null } })
          .executionOutcome,
      ).toBeNull();
    },
  );

  it.each([
    { status: AgentTurnStatus.FAILED, outcome: 'failed' },
    { status: AgentTurnStatus.CANCELLED, outcome: 'cancelled' },
  ])(
    'distinguishes $status from a successful execution',
    ({ status, outcome }) => {
      expect(
        project({ latestTurn: { ...TURN, status } }).executionOutcome,
      ).toBe(outcome);
    },
  );

  it('does not call a completed human-message turn an assistant success', () => {
    const humanTurn = { ...TURN, modelId: null };
    expect(
      project({
        message: {
          ...MESSAGE,
          role: AgentMessageRole.USER,
          senderWorkspaceMemberId: 'sender',
        },
        messageTurn: humanTurn,
        latestTurn: humanTurn,
      }),
    ).toMatchObject({
      senderType: 'member',
      senderId: 'sender',
      executionOutcome: null,
    });
  });

  it('names application messages without treating their completed shell as an AI run', () => {
    const applicationTurn = {
      ...TURN,
      modelId: null,
      createdBy: {
        source: FieldActorSource.APPLICATION,
        workspaceMemberId: null,
        name: 'Renewals',
        context: { applicationId: 'application' },
      },
    };
    expect(
      project({
        message: { ...MESSAGE, senderApplicationId: 'application' },
        messageTurn: applicationTurn,
        latestTurn: applicationTurn,
      }),
    ).toMatchObject({
      senderType: 'application',
      senderId: 'application',
      senderName: 'Renewals',
      executionOutcome: null,
    });
  });

  it('uses the persisted workflow actor rather than the thread owner or opener text', () => {
    const workflowTurn = {
      ...TURN,
      modelId: null,
      createdBy: {
        source: FieldActorSource.WORKFLOW,
        workspaceMemberId: null,
        name: 'Pipeline digest',
        context: { workflowId: 'workflow' },
      },
    };
    expect(
      project({ messageTurn: workflowTurn, latestTurn: workflowTurn }),
    ).toMatchObject({
      senderType: 'workflow',
      senderId: 'workflow',
      senderName: 'Pipeline digest',
      executionOutcome: null,
    });
  });

  it('keeps unidentified legacy delivery neutral', () => {
    const shellTurn = {
      ...TURN,
      modelId: null,
      createdBy: {
        source: FieldActorSource.SYSTEM,
        workspaceMemberId: null,
        name: 'System',
        context: {},
      },
    };
    expect(
      project({ messageTurn: shellTurn, latestTurn: shellTurn }),
    ).toMatchObject({
      senderType: 'unknown',
      senderName: null,
      executionOutcome: null,
    });
  });

  it('does not carry an earlier AI success onto a later member message', () => {
    expect(
      project({
        message: {
          ...MESSAGE,
          turnId: 'later-human-turn',
          role: AgentMessageRole.USER,
          senderWorkspaceMemberId: 'sender',
          processedAt: '2026-11-03T10:03:00.000Z',
        },
      }).executionOutcome,
    ).toBeNull();
  });

  it('keeps an outstanding human request ahead of a finished or failed turn', () => {
    expect(
      project({
        thread: { ...THREAD, pendingQuestionMessageId: 'question' },
        latestTurn: { ...TURN, status: AgentTurnStatus.FAILED },
      }).executionOutcome,
    ).toBe('needsInput');
  });
});
