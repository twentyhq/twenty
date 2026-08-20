import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type CampaignMessageRow } from 'src/modules/emailing/types/campaign-message-row.type';
import { buildCampaignMessageInsertPayloads } from 'src/modules/emailing/utils/build-campaign-message-insert-payloads.util';
import { MessageParticipantRole } from 'twenty-shared/types';

const row: CampaignMessageRow = {
  recipient: {
    personId: 'person-1',
    email: 'ada@example.com',
    messageId: 'message-1',
  },
  messageId: 'message-1',
  threadId: 'thread-1',
  temporaryExternalId: 'temp-1',
};

const buildPayloads = (rows: CampaignMessageRow[]) =>
  buildCampaignMessageInsertPayloads({
    campaignId: 'campaign-1',
    messageChannelId: 'channel-1',
    fromAddress: 'news@example.com',
    subjectTemplate: 'Hello {{firstName}}',
    text: 'body',
    now: new Date('2026-01-01T00:00:00.000Z'),
    rows,
  });

describe('buildCampaignMessageInsertPayloads', () => {
  it('should queue every message it writes', () => {
    const { messages } = buildPayloads([row]);

    expect(messages).toHaveLength(1);
    expect(messages[0].deliveryStatus).toBe(
      CAMPAIGN_MESSAGE_DELIVERY_STATUS.QUEUED,
    );
    expect(messages[0].messageCampaignId).toBe('campaign-1');
  });

  it('should write a sender and a recipient participant for each message', () => {
    const { participants } = buildPayloads([row]);

    expect(participants).toHaveLength(2);

    const sender = participants.find(
      (participant) => participant.role === MessageParticipantRole.FROM,
    );
    const recipient = participants.find(
      (participant) => participant.role === MessageParticipantRole.TO,
    );

    expect(sender?.handle).toBe('news@example.com');
    expect(recipient?.handle).toBe('ada@example.com');
    expect(recipient?.personId).toBe('person-1');
  });

  it('should only attribute the recipient to the campaign', () => {
    const { participants } = buildPayloads([row]);

    const sender = participants.find(
      (participant) => participant.role === MessageParticipantRole.FROM,
    );
    const recipient = participants.find(
      (participant) => participant.role === MessageParticipantRole.TO,
    );

    expect(sender).not.toHaveProperty('messageCampaignId');
    expect(recipient?.messageCampaignId).toBe('campaign-1');
  });

  it('should point the channel association at the same temporary id as the message', () => {
    const { messages, channelAssociations } = buildPayloads([row]);

    expect(channelAssociations[0].messageExternalId).toBe(
      messages[0].headerMessageId,
    );
    expect(channelAssociations[0].messageChannelId).toBe('channel-1');
  });

  it('should return nothing to insert for an empty chunk', () => {
    const payloads = buildPayloads([]);

    expect(payloads.messageThreads).toEqual([]);
    expect(payloads.messages).toEqual([]);
    expect(payloads.channelAssociations).toEqual([]);
    expect(payloads.participants).toEqual([]);
  });
});
