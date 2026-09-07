import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { CAMPAIGN_FAILURE_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-failure-reason.constant';
import { CAMPAIGN_SKIP_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-skip-reason.constant';
import { type CampaignBatchSendOutcome } from 'src/modules/emailing/types/campaign-batch-send-outcome.type';
import { type CampaignDeliverySettlement } from 'src/modules/emailing/types/campaign-delivery-settlement.type';
import { resolveCampaignSendFailure } from 'src/modules/emailing/utils/resolve-campaign-send-failure.util';
import { isDefined } from 'twenty-shared/utils';

export const resolveCampaignBatchSettlements = ({
  claimedRecipients,
  outcome,
}: {
  claimedRecipients: { messageId: string }[];
  outcome: CampaignBatchSendOutcome;
}): CampaignDeliverySettlement[] => {
  const settlementByDeliveryId = new Map<string, CampaignDeliverySettlement>();

  for (const recipientIndex of outcome.suppressedRecipientIndexes) {
    const recipient = claimedRecipients[recipientIndex];

    if (!isDefined(recipient)) {
      continue;
    }

    settlementByDeliveryId.set(recipient.messageId, {
      deliveryId: recipient.messageId,
      state: CAMPAIGN_DELIVERY_STATE.SKIPPED,
      skipReason: CAMPAIGN_SKIP_REASON.SUPPRESSED,
      failureReason: null,
      providerMessageId: null,
      sentAt: null,
    });
  }

  for (const entry of outcome.entries) {
    const recipient = claimedRecipients[entry.recipientIndex];

    if (!isDefined(recipient)) {
      continue;
    }

    if (!isDefined(entry.messageId)) {
      const { state, skipReason, failureReason } = resolveCampaignSendFailure(
        new Error(entry.errorMessage ?? 'Provider rejected the destination'),
      );

      settlementByDeliveryId.set(recipient.messageId, {
        deliveryId: recipient.messageId,
        state,
        skipReason,
        failureReason,
        providerMessageId: null,
        sentAt: null,
      });

      continue;
    }

    settlementByDeliveryId.set(recipient.messageId, {
      deliveryId: recipient.messageId,
      state: CAMPAIGN_DELIVERY_STATE.SENT,
      skipReason: null,
      failureReason: null,
      providerMessageId: entry.messageId,
      sentAt: new Date(),
    });
  }

  for (const recipient of claimedRecipients) {
    if (settlementByDeliveryId.has(recipient.messageId)) {
      continue;
    }

    settlementByDeliveryId.set(recipient.messageId, {
      deliveryId: recipient.messageId,
      state: CAMPAIGN_DELIVERY_STATE.FAILED,
      skipReason: null,
      failureReason: CAMPAIGN_FAILURE_REASON.UNKNOWN,
      providerMessageId: null,
      sentAt: null,
    });
  }

  return [...settlementByDeliveryId.values()];
};
