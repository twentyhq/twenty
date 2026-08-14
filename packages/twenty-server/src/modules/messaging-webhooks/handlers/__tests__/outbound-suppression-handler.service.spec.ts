import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';
import { type MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';
import { type MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';
import { OutboundSuppressionHandlerService } from 'src/modules/messaging-webhooks/handlers/outbound-suppression-handler.service';

describe('OutboundSuppressionHandlerService', () => {
  let messageSuppressionService: { suppress: jest.Mock };
  let messageCampaignService: {
    recordDeliveryFailureByProviderMessageId: jest.Mock;
  };
  let handler: OutboundSuppressionHandlerService;

  beforeEach(() => {
    messageSuppressionService = { suppress: jest.fn().mockResolvedValue({}) };
    messageCampaignService = {
      recordDeliveryFailureByProviderMessageId: jest.fn(),
    };
    handler = new OutboundSuppressionHandlerService(
      messageSuppressionService as unknown as MessageSuppressionService,
      messageCampaignService as unknown as MessageCampaignService,
    );
  });

  it('should record a bounced delivery and suppress every recipient', async () => {
    await handler.handle({
      workspaceId: 'workspace-1',
      reason: MessageSuppressionReason.BOUNCE,
      emailAddresses: ['a@example.com', 'b@example.com'],
      providerMessageId: 'provider-message-id',
      providerEventId: 'feedback-id',
    });

    expect(
      messageCampaignService.recordDeliveryFailureByProviderMessageId,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-1',
      providerMessageId: 'provider-message-id',
      deliveryStatus: 'BOUNCED',
    });
    expect(messageSuppressionService.suppress).toHaveBeenCalledTimes(2);
    expect(messageSuppressionService.suppress).toHaveBeenCalledWith({
      workspaceId: 'workspace-1',
      emailAddress: 'a@example.com',
      reason: MessageSuppressionReason.BOUNCE,
      source: MessageSuppressionSource.WEBHOOK,
      providerEventId: 'feedback-id',
    });
  });

  it('should record complaints with the complained delivery status', async () => {
    await handler.handle({
      workspaceId: 'workspace-1',
      reason: MessageSuppressionReason.COMPLAINT,
      emailAddresses: ['a@example.com'],
      providerMessageId: 'provider-message-id',
      providerEventId: null,
    });

    expect(
      messageCampaignService.recordDeliveryFailureByProviderMessageId,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-1',
      providerMessageId: 'provider-message-id',
      deliveryStatus: 'COMPLAINED',
    });
  });

  it('should not record delivery failure without a provider message id', async () => {
    await handler.handle({
      workspaceId: 'workspace-1',
      reason: MessageSuppressionReason.BOUNCE,
      emailAddresses: ['a@example.com'],
      providerMessageId: null,
      providerEventId: null,
    });

    expect(
      messageCampaignService.recordDeliveryFailureByProviderMessageId,
    ).not.toHaveBeenCalled();
    expect(messageSuppressionService.suppress).toHaveBeenCalledTimes(1);
  });

  it('should throw when suppressing any recipient fails', async () => {
    messageSuppressionService.suppress
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('db down'));

    await expect(
      handler.handle({
        workspaceId: 'workspace-1',
        reason: MessageSuppressionReason.BOUNCE,
        emailAddresses: ['a@example.com', 'b@example.com'],
        providerMessageId: null,
        providerEventId: null,
      }),
    ).rejects.toThrow('Failed to suppress one or more recipients');
  });
});
