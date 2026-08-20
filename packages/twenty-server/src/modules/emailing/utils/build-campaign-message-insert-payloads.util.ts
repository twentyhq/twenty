import { v4 } from 'uuid';

import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type CampaignMessageRow } from 'src/modules/emailing/types/campaign-message-row.type';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { MessageParticipantRole } from 'twenty-shared/types';

export const buildCampaignMessageInsertPayloads = ({
  campaignId,
  messageChannelId,
  fromAddress,
  subjectTemplate,
  text,
  now,
  rows,
}: {
  campaignId: string;
  messageChannelId: string;
  fromAddress: string;
  subjectTemplate: string;
  text: string;
  now: Date;
  rows: CampaignMessageRow[];
}) => ({
  messageThreads: rows.map((row) => ({ id: row.threadId })),
  messages: rows.map((row) => ({
    id: row.messageId,
    headerMessageId: row.temporaryExternalId,
    subject: subjectTemplate,
    text,
    receivedAt: now,
    messageThreadId: row.threadId,
    messageCampaignId: campaignId,
    deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.QUEUED,
  })),
  channelAssociations: rows.map((row) => ({
    id: v4(),
    messageId: row.messageId,
    messageChannelId,
    messageExternalId: row.temporaryExternalId,
    messageThreadExternalId: row.temporaryExternalId,
    direction: MessageDirection.OUTGOING,
  })),
  participants: rows.flatMap((row) => [
    {
      id: v4(),
      messageId: row.messageId,
      role: MessageParticipantRole.FROM,
      handle: fromAddress,
      displayName: fromAddress,
    },
    {
      id: v4(),
      messageId: row.messageId,
      role: MessageParticipantRole.TO,
      handle: row.recipient.email,
      displayName: row.recipient.email,
      personId: row.recipient.personId,
      messageCampaignId: campaignId,
    },
  ]),
});
