import { normalizeSendInboxMessageInput } from 'src/engine/metadata-modules/ai/ai-chat/utils/normalize-send-inbox-message-input.util';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const MESSAGE = {
  idempotencyKey: 'first-recording',
  text: 'Your call was recorded.',
};

const KEYED = { threadKey: 'calls', title: 'Call recordings' };

const expectInvalidInput = (
  input: Parameters<typeof normalizeSendInboxMessageInput>[0],
) => {
  expect(() => normalizeSendInboxMessageInput(input)).toThrow(
    expect.objectContaining({
      code: AiExceptionCode.INVALID_INBOX_MESSAGE_INPUT,
    }),
  );
};

describe('normalizeSendInboxMessageInput', () => {
  it('keys the conversation the message may open', () => {
    expect(
      normalizeSendInboxMessageInput({
        ...MESSAGE,
        ...KEYED,
        workspaceMemberIds: ['jane'],
        toolCall: { toolName: 'ask_question' },
      }),
    ).toEqual({
      ...MESSAGE,
      toolCall: { toolName: 'ask_question' },
      addressing: { ...KEYED, channelId: undefined },
      workspaceMemberIds: ['jane'],
      mentionedWorkspaceMemberIds: [],
      recordTargets: [],
    });
  });

  it('files a conversation with no recipient in a channel', () => {
    expect(
      normalizeSendInboxMessageInput({
        ...MESSAGE,
        ...KEYED,
        channelId: 'channel-id',
      }).addressing,
    ).toEqual({ ...KEYED, channelId: 'channel-id' });
  });

  it('addresses an existing conversation, whose title is not its to set', () => {
    expect(
      normalizeSendInboxMessageInput({
        ...MESSAGE,
        threadId: 'thread-id',
        title: 'Ignored',
      }),
    ).toEqual({
      ...MESSAGE,
      addressing: { threadId: 'thread-id' },
      workspaceMemberIds: [],
      mentionedWorkspaceMemberIds: [],
      recordTargets: [],
    });
  });

  it('adds each mentioned member to the recipients once', () => {
    expect(
      normalizeSendInboxMessageInput({
        ...MESSAGE,
        ...KEYED,
        workspaceMemberIds: ['jane', 'tim', 'jane'],
        mentionedWorkspaceMemberIds: ['tim', 'ada', 'tim'],
      }),
    ).toMatchObject({
      workspaceMemberIds: ['jane', 'tim', 'ada'],
      mentionedWorkspaceMemberIds: ['tim', 'ada'],
    });
  });

  it('keeps each record target once', () => {
    expect(
      normalizeSendInboxMessageInput({
        ...MESSAGE,
        threadId: 'thread-id',
        recordTargets: [
          { objectNameSingular: 'company', recordId: 'company-id' },
          { objectNameSingular: 'person', recordId: 'company-id' },
          { objectNameSingular: 'company', recordId: 'company-id' },
        ],
      }).recordTargets,
    ).toEqual([
      { objectNameSingular: 'company', recordId: 'company-id' },
      { objectNameSingular: 'person', recordId: 'company-id' },
    ]);
  });

  it('refuses a message addressed both ways, or neither', () => {
    expectInvalidInput({
      ...MESSAGE,
      ...KEYED,
      threadId: 'thread-id',
      workspaceMemberIds: ['jane'],
    });
    expectInvalidInput({ ...MESSAGE, workspaceMemberIds: ['jane'] });
  });

  it('refuses a channel for an existing conversation', () => {
    expectInvalidInput({
      ...MESSAGE,
      threadId: 'thread-id',
      channelId: 'channel-id',
    });
  });

  it('refuses a keyed conversation without a title', () => {
    expectInvalidInput({
      ...MESSAGE,
      threadKey: 'calls',
      workspaceMemberIds: ['jane'],
    });
  });

  it('refuses a keyed conversation nobody would receive', () => {
    expectInvalidInput({ ...MESSAGE, ...KEYED });
    expectInvalidInput({ ...MESSAGE, ...KEYED, workspaceMemberIds: [] });
  });
});
