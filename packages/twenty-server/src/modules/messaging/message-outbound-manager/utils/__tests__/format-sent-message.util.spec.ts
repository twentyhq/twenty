import { MessageParticipantRole } from 'twenty-shared/types';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { type PersistSentMessageInput } from 'src/modules/messaging/message-outbound-manager/types/persist-sent-message-input.type';
import { formatSentMessage } from 'src/modules/messaging/message-outbound-manager/utils/format-sent-message.util';

const buildInput = (
  overrides: Partial<PersistSentMessageInput> = {},
): PersistSentMessageInput => ({
  sendResult: {
    headerMessageId: '<msg-1@mail.example>',
    messageExternalId: 'gmail-external-1',
    threadExternalId: 'thread-external-1',
  },
  subject: 'Quarterly review',
  body: 'See attached.',
  recipients: { to: [], cc: [], bcc: [] },
  connectedAccount: {
    handle: 'sender@example.com',
  } as ConnectedAccountEntity,
  messageChannelId: 'channel-1',
  workspaceId: 'workspace-1',
  ...overrides,
});

describe('formatSentMessage', () => {
  it('should mark the message as OUTGOING with the sender as FROM participant', () => {
    const message = formatSentMessage(buildInput());

    expect(message.direction).toBe(MessageDirection.OUTGOING);
    expect(message.participants).toContainEqual({
      role: MessageParticipantRole.FROM,
      handle: 'sender@example.com',
      displayName: 'sender@example.com',
    });
  });

  it('should emit one participant per to/cc/bcc recipient with correct roles', () => {
    const message = formatSentMessage(
      buildInput({
        recipients: {
          to: ['alice@example.com'],
          cc: ['bob@example.com', 'carol@example.com'],
          bcc: ['dave@example.com'],
        },
      }),
    );

    const rolesByHandle = Object.fromEntries(
      message.participants.map((participant) => [
        participant.handle,
        participant.role,
      ]),
    );

    expect(rolesByHandle).toEqual({
      'sender@example.com': MessageParticipantRole.FROM,
      'alice@example.com': MessageParticipantRole.TO,
      'bob@example.com': MessageParticipantRole.CC,
      'carol@example.com': MessageParticipantRole.CC,
      'dave@example.com': MessageParticipantRole.BCC,
    });
  });

  it('should fall back to the headerMessageId when the provider omits external ids so unrelated sends do not collide on a shared empty thread key', () => {
    const message = formatSentMessage(
      buildInput({
        sendResult: {
          headerMessageId: '<msg-2@mail.example>',
          messageExternalId: undefined,
          threadExternalId: undefined,
        },
      }),
    );

    expect(message.externalId).toBe('<msg-2@mail.example>');
    expect(message.messageThreadExternalId).toBe('<msg-2@mail.example>');
    expect(message.headerMessageId).toBe('<msg-2@mail.example>');
  });

  it('should copy subject and body verbatim and start with no folder associations', () => {
    const message = formatSentMessage(buildInput());

    expect(message.subject).toBe('Quarterly review');
    expect(message.text).toBe('See attached.');
    expect(message.attachments).toEqual([]);
    expect(message.messageFolderIds).toBeUndefined();
  });
});
