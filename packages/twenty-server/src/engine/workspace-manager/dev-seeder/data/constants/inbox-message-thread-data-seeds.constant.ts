import { MessageParticipantRole } from 'twenty-shared/types';

import { getSeededEmailGroupDomains } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-emailing-domains.util';
import { getMessageChannelSeedIds } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-metadata-entities.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';

// The two Support inbox items point at these threads, so what the pane shows
// above the reply is the mail the item is about, received on the shared
// address the queue answers from.
export const INBOX_MESSAGE_THREAD_DATA_SEED_IDS = {
  REFUND: '20202020-7a1e-4b2c-9d3e-300000000001',
  SHIPPING: '20202020-7a1e-4b2c-9d3e-300000000002',
} as const;

const HOUR_IN_MS = 60 * 60 * 1000;

type SeededThreadMessage = {
  id: string;
  threadId: string;
  subject: string;
  text: string;
  headerMessageId: string;
  hoursAgo: number;
  direction: MessageDirection;
  from: { handle: string; displayName: string; workspaceMemberId?: string };
  to: { handle: string; displayName: string; workspaceMemberId?: string };
};

const PRIYA = { handle: 'priya@northwind.com', displayName: 'Priya Raman' };
const SAM = { handle: 'sam@bellweather.co', displayName: 'Sam Okafor' };

const getSeededThreadMessages = (
  workspaceId: string,
): SeededThreadMessage[] => {
  const support = {
    handle: `support@${getSeededEmailGroupDomains(workspaceId).verified}`,
    displayName: 'Support',
  };
  const tim = {
    ...support,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
  };

  return [
    {
      id: '20202020-7a1e-4b2c-9d3e-310000000001',
      threadId: INBOX_MESSAGE_THREAD_DATA_SEED_IDS.REFUND,
      subject: 'Duplicate charge on invoice 4482',
      text: 'Hi,\n\nWe seem to have been billed twice for September on invoice 4482, the two charges are on the same invoice. Could you refund one of them?\n\nThanks,\nPriya',
      headerMessageId: '<refund-4482-1@northwind.com>',
      hoursAgo: 0.7,
      direction: MessageDirection.INCOMING,
      from: PRIYA,
      to: support,
    },
    {
      id: '20202020-7a1e-4b2c-9d3e-320000000001',
      threadId: INBOX_MESSAGE_THREAD_DATA_SEED_IDS.SHIPPING,
      subject: 'Order 10431 still not here',
      text: 'Hello,\n\nOrder 10431 was placed ten days ago and I have not received anything, not even a shipping notice. Can you tell me where it is?\n\nSam',
      headerMessageId: '<order-10431-1@bellweather.co>',
      hoursAgo: 46,
      direction: MessageDirection.INCOMING,
      from: SAM,
      to: support,
    },
    {
      id: '20202020-7a1e-4b2c-9d3e-320000000002',
      threadId: INBOX_MESSAGE_THREAD_DATA_SEED_IDS.SHIPPING,
      subject: 'Re: Order 10431 still not here',
      text: 'Hi Sam,\n\nSorry about that. The order left the warehouse this morning and the carrier says it will be with you by Thursday. You should get a tracking email within the hour.\n\nTim',
      headerMessageId: '<order-10431-2@support>',
      hoursAgo: 22,
      direction: MessageDirection.OUTGOING,
      from: tim,
      to: SAM,
    },
    {
      id: '20202020-7a1e-4b2c-9d3e-320000000003',
      threadId: INBOX_MESSAGE_THREAD_DATA_SEED_IDS.SHIPPING,
      subject: 'Re: Order 10431 still not here',
      text: 'Thanks for the update yesterday, but tracking still shows nothing. Can you check with the carrier?\n\nSam',
      headerMessageId: '<order-10431-3@bellweather.co>',
      hoursAgo: 1,
      direction: MessageDirection.INCOMING,
      from: SAM,
      to: support,
    },
  ];
};

const threadSubjects: Record<string, string> = {
  [INBOX_MESSAGE_THREAD_DATA_SEED_IDS.REFUND]:
    'Duplicate charge on invoice 4482',
  [INBOX_MESSAGE_THREAD_DATA_SEED_IDS.SHIPPING]: 'Order 10431 still not here',
};

export const getInboxMessageThreadDataSeeds = (workspaceId: string) => {
  const now = Date.now();
  const messages = getSeededThreadMessages(workspaceId);
  const supportGroupChannelId =
    getMessageChannelSeedIds(workspaceId).SUPPORT_GROUP;

  const at = (hoursAgo: number) => new Date(now - hoursAgo * HOUR_IN_MS);

  return {
    messageThreads: Object.entries(threadSubjects).map(([id, subject]) => ({
      id,
      createdAt: at(48),
      updatedAt: at(1),
      deletedAt: null,
      subject,
    })),
    messages: messages.map((message) => ({
      id: message.id,
      createdAt: at(message.hoursAgo),
      updatedAt: at(message.hoursAgo),
      deletedAt: null,
      receivedAt: at(message.hoursAgo),
      text: message.text,
      subject: message.subject,
      messageThreadId: message.threadId,
      headerMessageId: message.headerMessageId,
    })),
    messageParticipants: messages.flatMap((message, index) =>
      (
        [
          [message.from, MessageParticipantRole.FROM],
          [message.to, MessageParticipantRole.TO],
        ] as const
      ).map(([participant, role], roleIndex) => ({
        id: `20202020-7a1e-4b2c-9d3e-33000000${String(index * 2 + roleIndex + 1).padStart(4, '0')}`,
        createdAt: at(message.hoursAgo),
        updatedAt: at(message.hoursAgo),
        deletedAt: null,
        workspaceMemberId: participant.workspaceMemberId ?? null,
        personId: null,
        displayName: participant.displayName,
        handle: participant.handle,
        role,
        messageId: message.id,
      })),
    ),
    messageChannelMessageAssociations: messages.map((message, index) => ({
      id: `20202020-7a1e-4b2c-9d3e-34000000${String(index + 1).padStart(4, '0')}`,
      createdAt: at(message.hoursAgo),
      updatedAt: at(message.hoursAgo),
      deletedAt: null,
      messageExternalId: message.headerMessageId,
      messageThreadExternalId: message.threadId,
      messageChannelId: supportGroupChannelId,
      messageId: message.id,
      direction: message.direction,
    })),
  };
};
