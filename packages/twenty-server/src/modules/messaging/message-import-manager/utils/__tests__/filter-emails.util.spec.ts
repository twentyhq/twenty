import { MessageParticipantRole } from 'twenty-shared/types';

import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { messagingGetMessagesServiceGetMessages } from 'src/modules/messaging/message-import-manager/utils/__mocks__/messages';
import { filterEmails } from 'src/modules/messaging/message-import-manager/utils/filter-emails.util';

describe('filterEmails', () => {
  it('Should not filter at all if primary handle is a personal email', () => {
    const primaryHandle = 'guillim@gmail.com';
    const messages = messagingGetMessagesServiceGetMessages;

    const filteredMessages = filterEmails(primaryHandle, [], messages, []);

    expect(filteredMessages).toEqual(messages);
  });

  it('Should not filter out if at least one email is from a different domain', () => {
    const primaryHandle = 'guillim@acme.com';
    const messages = messagingGetMessagesServiceGetMessages.filter(
      (message) => message.externalId === 'AA-work-emails-external',
    );

    const filteredMessages = filterEmails(primaryHandle, [], messages, []);

    expect(filteredMessages).toEqual(messages);
  });

  it('Should filter out same domain emails', () => {
    const primaryHandle = 'guillim@acme.com';
    const messages = messagingGetMessagesServiceGetMessages.filter(
      (message) => message.externalId === 'AA-work-emails-internal',
    );

    const filteredMessages = filterEmails(primaryHandle, [], messages, []);

    expect(filteredMessages).toEqual([]);
  });

  it('Should filter messages with participant from the blocklist', () => {
    const primaryHandle = 'guillim@acme.com';
    const messages = messagingGetMessagesServiceGetMessages.filter(
      (message) => message.externalId === 'AA-work-emails-internal',
    );
    const blocklist = ['to@acme.com'];
    const filteredMessages = filterEmails(
      primaryHandle,
      [],
      messages,
      blocklist,
    );

    expect(filteredMessages).toEqual([]);
  });

  it('should filter out messages from group email addresses', () => {
    const primaryHandle = 'user@example.com';
    const messages: MessageWithParticipants[] = [
      {
        externalId: 'noreply-message',
        subject: 'Automated message',
        receivedAt: new Date('2025-01-09T09:54:37.000Z'),
        text: 'This is an automated message',
        headerMessageId: '<noreply@example.com>',
        messageThreadExternalId: 'thread-1',
        direction: MessageDirection.INCOMING,
        participants: [
          {
            role: MessageParticipantRole.FROM,
            handle: 'noreply@example.com',
            displayName: 'No Reply',
          },
        ],
        attachments: [],
      },
      {
        externalId: 'support-message',
        subject: 'Support ticket',
        receivedAt: new Date('2025-01-09T09:54:37.000Z'),
        text: 'Support response',
        headerMessageId: '<support@company.com>',
        messageThreadExternalId: 'thread-2',
        direction: MessageDirection.INCOMING,
        participants: [
          {
            role: MessageParticipantRole.FROM,
            handle: 'support@company.com',
            displayName: 'Support Team',
          },
        ],
        attachments: [],
      },
      {
        externalId: 'regular-message',
        subject: 'Personal message',
        receivedAt: new Date('2025-01-09T10:54:37.000Z'),
        text: 'This is a personal message',
        headerMessageId: '<john@example.com>',
        messageThreadExternalId: 'thread-3',
        direction: MessageDirection.INCOMING,
        participants: [
          {
            role: MessageParticipantRole.FROM,
            handle: 'john@example.com',
            displayName: 'John Doe',
          },
        ],
        attachments: [],
      },
    ];

    const result = filterEmails(primaryHandle, [], messages, []);

    expect(result).toHaveLength(1);
    expect(result[0].externalId).toBe('regular-message');
  });

  it('should not filter out group emails when excludeGroupEmails is false', () => {
    const primaryHandle = 'user@example.com';
    const messages: MessageWithParticipants[] = [
      {
        externalId: 'noreply-message',
        subject: 'Automated message',
        receivedAt: new Date('2025-01-09T09:54:37.000Z'),
        text: 'This is an automated message',
        headerMessageId: '<noreply@example.com>',
        messageThreadExternalId: 'thread-1',
        direction: MessageDirection.INCOMING,
        participants: [
          {
            role: MessageParticipantRole.FROM,
            handle: 'noreply@example.com',
            displayName: 'No Reply',
          },
        ],
        attachments: [],
      },
    ];

    const result = filterEmails(primaryHandle, [], messages, [], false);

    expect(result).toEqual(messages);
  });

  it('should keep messages without participants', () => {
    const primaryHandle = 'user@example.com';
    const messages: MessageWithParticipants[] = [
      {
        externalId: 'no-participants',
        subject: 'Test',
        receivedAt: new Date('2025-01-09T09:54:37.000Z'),
        text: 'Test content',
        headerMessageId: '<test@example.com>',
        messageThreadExternalId: 'thread-1',
        direction: MessageDirection.INCOMING,
        participants: undefined as any,
        attachments: [],
      },
    ];

    const result = filterEmails(primaryHandle, [], messages, []);

    expect(result).toEqual(messages);
  });

  it('should keep regular personal email addresses', () => {
    const primaryHandle = 'user@example.com';
    const messages: MessageWithParticipants[] = [
      {
        externalId: 'personal-1',
        subject: 'Personal message',
        receivedAt: new Date('2025-01-09T09:54:37.000Z'),
        text: 'Content',
        headerMessageId: '<john.doe@example.com>',
        messageThreadExternalId: 'thread-1',
        direction: MessageDirection.INCOMING,
        participants: [
          {
            role: MessageParticipantRole.FROM,
            handle: 'john.doe@example.com',
            displayName: 'John Doe',
          },
        ],
        attachments: [],
      },
    ];

    const result = filterEmails(primaryHandle, [], messages, []);

    expect(result).toEqual(messages);
  });

  it('should not filter out messages when user handle looks like a group email', () => {
    const primaryHandle = 'hello@company.com';
    const handleAliases = ['support@company.com'];
    const messages: MessageWithParticipants[] = [
      {
        externalId: 'user-sent-message',
        subject: 'User sent message',
        receivedAt: new Date('2025-01-09T09:54:37.000Z'),
        text: 'User sending from hello@ address',
        headerMessageId: '<msg1@company.com>',
        messageThreadExternalId: 'thread-1',
        direction: MessageDirection.OUTGOING,
        participants: [
          {
            role: MessageParticipantRole.FROM,
            handle: 'hello@company.com',
            displayName: 'Hello',
          },
          {
            role: MessageParticipantRole.TO,
            handle: 'john@other.com',
            displayName: 'John',
          },
        ],
        attachments: [],
      },
      {
        externalId: 'alias-sent-message',
        subject: 'Alias sent message',
        receivedAt: new Date('2025-01-09T09:54:37.000Z'),
        text: 'User sending from support@ alias',
        headerMessageId: '<msg2@company.com>',
        messageThreadExternalId: 'thread-2',
        direction: MessageDirection.OUTGOING,
        participants: [
          {
            role: MessageParticipantRole.FROM,
            handle: 'support@company.com',
            displayName: 'Support',
          },
          {
            role: MessageParticipantRole.TO,
            handle: 'jane@other.com',
            displayName: 'Jane',
          },
        ],
        attachments: [],
      },
      {
        externalId: 'reply-from-john',
        subject: 'Reply from John',
        receivedAt: new Date('2025-01-09T10:54:37.000Z'),
        text: 'John replying to the user',
        headerMessageId: '<msg3@other.com>',
        messageThreadExternalId: 'thread-1',
        direction: MessageDirection.INCOMING,
        participants: [
          {
            role: MessageParticipantRole.FROM,
            handle: 'john@other.com',
            displayName: 'John',
          },
          {
            role: MessageParticipantRole.TO,
            handle: 'hello@company.com',
            displayName: 'Hello',
          },
        ],
        attachments: [],
      },
      {
        externalId: 'incoming-from-noreply',
        subject: 'From external noreply',
        receivedAt: new Date('2025-01-09T11:54:37.000Z'),
        text: 'Incoming from external group address',
        headerMessageId: '<msg4@external.com>',
        messageThreadExternalId: 'thread-3',
        direction: MessageDirection.INCOMING,
        participants: [
          {
            role: MessageParticipantRole.FROM,
            handle: 'noreply@external.com',
            displayName: 'No Reply',
          },
          {
            role: MessageParticipantRole.TO,
            handle: 'hello@company.com',
            displayName: 'Hello',
          },
        ],
        attachments: [],
      },
    ];

    const result = filterEmails(primaryHandle, handleAliases, messages, []);

    expect(result).toHaveLength(3);
    expect(result.map((msg) => msg.externalId)).toEqual([
      'user-sent-message',
      'alias-sent-message',
      'reply-from-john',
    ]);
  });
});
