import { type InboundEmailImportService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/services/inbound-email-import.service';
import { MessagingInboundEmailImportJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-inbound-email-import.job';

describe('MessagingInboundEmailImportJob', () => {
  let inboundEmailImportService: { importInboundMessage: jest.Mock };
  let job: MessagingInboundEmailImportJob;

  beforeEach(() => {
    inboundEmailImportService = {
      importInboundMessage: jest.fn().mockResolvedValue({ kind: 'imported' }),
    };
    job = new MessagingInboundEmailImportJob(
      inboundEmailImportService as unknown as InboundEmailImportService,
    );
  });

  it('should pass through source and reference payloads', async () => {
    await job.handle({
      source: 'SES_S3',
      reference: 'raw/object-key',
      envelopeRecipients: ['ch_abc@groups.example.com'],
    });

    expect(inboundEmailImportService.importInboundMessage).toHaveBeenCalledWith(
      {
        messageReference: { source: 'SES_S3', reference: 'raw/object-key' },
        envelopeRecipients: ['ch_abc@groups.example.com'],
      },
    );
  });

  it('should normalize legacy s3Key payloads to the SES_S3 source', async () => {
    await job.handle({
      s3Key: 'raw/legacy-key',
      envelopeRecipients: ['ch_abc@groups.example.com'],
    });

    expect(inboundEmailImportService.importInboundMessage).toHaveBeenCalledWith(
      {
        messageReference: { source: 'SES_S3', reference: 'raw/legacy-key' },
        envelopeRecipients: ['ch_abc@groups.example.com'],
      },
    );
  });
});
