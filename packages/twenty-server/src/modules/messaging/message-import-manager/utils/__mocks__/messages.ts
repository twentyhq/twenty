import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

export const messagingGetMessagesServiceGetMessages = [
  {
    externalId: 'AA-work-emails-internal',
    subject: 'Test email for microsoft',
    receivedAt: new Date('2025-01-09T09:54:37.000Z'),
    text: 'Just a test',
    headerMessageId: '<d45b9f1c@PR0P264MB2911.FRAP264.PROD.OUTLOOK.COM>',
    messageThreadExternalId: 'AAQkAGZlMDQ1NjU5Lk=',
    direction: 'OUTGOING',
    participants: [
      {
        role: 'from',
        handle: 'from@acme.com',
        displayName: 'From',
      },
      {
        role: 'to',
        handle: 'to@acme.com',
        displayName: 'To',
      },
    ],
    attachments: [],
  },
  {
    externalId: 'AA-work-emails-external',
    subject: 'Test email for microsoft',
    receivedAt: new Date('2025-01-09T09:54:37.000Z'),
    text: 'Just a test',
    headerMessageId: '<d45b9f1c@PR0P264MB2911.FRAP264.PROD.OUTLOOK.COM>',
    messageThreadExternalId: 'AAQkAGZlMDQ1NjU5Lk=',
    direction: 'OUTGOING',
    participants: [
      {
        role: 'from',
        handle: 'from@acme.com',
        displayName: 'From',
      },
      {
        role: 'to',
        handle: 'to@external.com',
        displayName: 'To',
      },
    ],
    attachments: [],
  },
  {
    externalId: 'AA-personal-emails',
    subject: 'Sign in to your Microsoft Learn account for more features',
    receivedAt: new Date('2025-01-28T19:01:21.000Z'),
    text: 'Learn with interactive sandboxes, curated collections, and bookmarks',
    headerMessageId: '<AC70000@mails.microsoft.com>',
    messageThreadExternalId: 'AAQkAGZlMDQ1NNc=',
    direction: 'INCOMING',
    participants: [
      {
        role: 'from',
        handle: 'learn@mails.microsoft.com',
        displayName: 'Microsoft Learn',
      },
      {
        role: 'to',
        handle: 'to@gmail.com',
        displayName: 'To',
      },
    ],
    attachments: [],
  },
] as MessageWithParticipants[];
