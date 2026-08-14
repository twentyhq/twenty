import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type InboundUnsubscribeHandlerService } from 'src/modules/messaging-webhooks/handlers/inbound-unsubscribe-handler.service';
import { InboundMailHandlerService } from 'src/modules/messaging-webhooks/handlers/inbound-mail-handler.service';
import { MessagingInboundEmailImportJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-inbound-email-import.job';

describe('InboundMailHandlerService', () => {
  let messageQueueService: { add: jest.Mock };
  let inboundUnsubscribeHandlerService: { handle: jest.Mock };
  let handler: InboundMailHandlerService;

  beforeEach(() => {
    messageQueueService = { add: jest.fn() };
    inboundUnsubscribeHandlerService = { handle: jest.fn() };
    handler = new InboundMailHandlerService(
      messageQueueService as unknown as MessageQueueService,
      inboundUnsubscribeHandlerService as unknown as InboundUnsubscribeHandlerService,
    );
  });

  it('should route mail addressed to the unsubscribe mailbox to the unsubscribe handler', async () => {
    await handler.handle({
      recipients: ['Unsubscribe@groups.example.com'],
      subject: 'token-subject',
      message: { source: 'SES_S3', reference: 'raw/key' },
      dedupeKey: 'sns-message-id',
    });

    expect(inboundUnsubscribeHandlerService.handle).toHaveBeenCalledWith(
      'token-subject',
    );
    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('should enqueue an import job deduplicated by the notification key', async () => {
    await handler.handle({
      recipients: ['ch_abc@groups.example.com'],
      subject: 'Hello',
      message: { source: 'SES_S3', reference: 'raw/key' },
      dedupeKey: 'sns-message-id',
    });

    expect(messageQueueService.add).toHaveBeenCalledWith(
      MessagingInboundEmailImportJob.name,
      {
        s3Key: 'raw/key',
        envelopeRecipients: ['ch_abc@groups.example.com'],
      },
      { id: 'sns-message-id' },
    );
    expect(inboundUnsubscribeHandlerService.handle).not.toHaveBeenCalled();
  });

  it('should skip notifications without retrievable message content', async () => {
    await handler.handle({
      recipients: ['ch_abc@groups.example.com'],
      subject: 'Hello',
      message: null,
      dedupeKey: 'sns-message-id',
    });

    expect(messageQueueService.add).not.toHaveBeenCalled();
    expect(inboundUnsubscribeHandlerService.handle).not.toHaveBeenCalled();
  });
});
