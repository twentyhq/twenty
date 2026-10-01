import { type CampaignDeliverySettlement } from 'src/modules/emailing/types/campaign-delivery-settlement.type';

export const buildCampaignDeliverySettleQuery = ({
  campaignDeliveryTableName,
  claimToken,
  settlements,
}: {
  campaignDeliveryTableName: string;
  claimToken: string;
  settlements: CampaignDeliverySettlement[];
}): { sql: string; parameters: Record<string, unknown> } => ({
  sql: `
WITH settled AS (
  UPDATE ${campaignDeliveryTableName} delivery
  SET
    "state" = source."state",
    "skipReason" = source."skipReason",
    "failureReason" = source."failureReason",
    "providerMessageId" = source."providerMessageId",
    "sentAt" = source."sentAt",
    "updatedAt" = now(),
    "claimToken" = NULL,
    "claimExpiresAt" = NULL
  FROM unnest(:deliveryIds::uuid[], :states::text[], :skipReasons::text[], :failureReasons::text[], :providerMessageIds::text[], :sentAtValues::timestamptz[])
    AS source("id", "state", "skipReason", "failureReason", "providerMessageId", "sentAt")
  WHERE delivery."id" = source."id"
    AND delivery."claimToken" = :claimToken
  RETURNING delivery."id"
)
SELECT "id" FROM settled
`,
  parameters: {
    deliveryIds: settlements.map(({ deliveryId }) => deliveryId),
    states: settlements.map(({ state }) => state),
    skipReasons: settlements.map(({ skipReason }) => skipReason ?? null),
    failureReasons: settlements.map(
      ({ failureReason }) => failureReason ?? null,
    ),
    providerMessageIds: settlements.map(
      ({ providerMessageId }) => providerMessageId ?? null,
    ),
    sentAtValues: settlements.map(({ sentAt }) => sentAt ?? null),
    claimToken,
  },
});
