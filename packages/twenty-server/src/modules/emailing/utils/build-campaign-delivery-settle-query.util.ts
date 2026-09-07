import { type CampaignDeliverySettlement } from 'src/modules/emailing/types/campaign-delivery-settlement.type';

export const buildCampaignDeliverySettleQuery = ({
  workspaceId,
  claimToken,
  settlements,
}: {
  workspaceId: string;
  claimToken: string;
  settlements: CampaignDeliverySettlement[];
}): { sql: string; parameters: unknown[] } => ({
  sql: `
WITH settled AS (
  UPDATE "core"."campaignDelivery" delivery
  SET
    "state" = source."state",
    "skipReason" = source."skipReason",
    "failureReason" = source."failureReason",
    "providerMessageId" = source."providerMessageId",
    "sentAt" = source."sentAt",
    "updatedAt" = now(),
    "claimToken" = NULL,
    "claimExpiresAt" = NULL
  FROM unnest($1::uuid[], $2::text[], $3::text[], $4::text[], $5::text[], $6::timestamptz[])
    AS source("id", "state", "skipReason", "failureReason", "providerMessageId", "sentAt")
  WHERE delivery."id" = source."id"
    AND delivery."workspaceId" = $7
    AND delivery."claimToken" = $8
  RETURNING delivery."id"
)
SELECT "id" FROM settled
`,
  parameters: [
    settlements.map(({ deliveryId }) => deliveryId),
    settlements.map(({ state }) => state),
    settlements.map(({ skipReason }) => skipReason ?? null),
    settlements.map(({ failureReason }) => failureReason ?? null),
    settlements.map(({ providerMessageId }) => providerMessageId ?? null),
    settlements.map(({ sentAt }) => sentAt ?? null),
    workspaceId,
    claimToken,
  ],
});
