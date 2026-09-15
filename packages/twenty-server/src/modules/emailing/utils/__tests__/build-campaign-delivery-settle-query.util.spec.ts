import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { CAMPAIGN_SKIP_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-skip-reason.constant';
import { type CampaignDeliverySettlement } from 'src/modules/emailing/types/campaign-delivery-settlement.type';
import { buildCampaignDeliverySettleQuery } from 'src/modules/emailing/utils/build-campaign-delivery-settle-query.util';

const SENT_AT = new Date('2026-01-01T00:00:00.000Z');

const buildSettlement = (
  overrides: Partial<CampaignDeliverySettlement> & { deliveryId: string },
): CampaignDeliverySettlement => ({
  state: CAMPAIGN_DELIVERY_STATE.SENT,
  skipReason: null,
  failureReason: null,
  providerMessageId: null,
  sentAt: null,
  ...overrides,
});

describe('buildCampaignDeliverySettleQuery', () => {
  it('keeps every settlement on its own row across the parallel arrays', () => {
    const { parameters } = buildCampaignDeliverySettleQuery({
      workspaceId: 'workspace-1',
      claimToken: 'claim-1',
      settlements: [
        buildSettlement({
          deliveryId: 'delivery-a',
          providerMessageId: 'provider-a',
          sentAt: SENT_AT,
        }),
        buildSettlement({
          deliveryId: 'delivery-b',
          state: CAMPAIGN_DELIVERY_STATE.SKIPPED,
          skipReason: CAMPAIGN_SKIP_REASON.SUPPRESSED,
        }),
      ],
    });

    const [
      deliveryIds,
      states,
      skipReasons,
      failureReasons,
      providerMessageIds,
      sentAtValues,
    ] = parameters;

    expect(deliveryIds).toEqual(['delivery-a', 'delivery-b']);
    expect(states).toEqual([
      CAMPAIGN_DELIVERY_STATE.SENT,
      CAMPAIGN_DELIVERY_STATE.SKIPPED,
    ]);
    expect(skipReasons).toEqual([null, CAMPAIGN_SKIP_REASON.SUPPRESSED]);
    expect(failureReasons).toEqual([null, null]);
    expect(providerMessageIds).toEqual(['provider-a', null]);
    expect(sentAtValues).toEqual([SENT_AT, null]);
  });

  it('settles two people who share an email address as two separate deliveries', () => {
    const { parameters } = buildCampaignDeliverySettleQuery({
      workspaceId: 'workspace-1',
      claimToken: 'claim-1',
      settlements: [
        buildSettlement({
          deliveryId: 'delivery-first',
          providerMessageId: 'provider-first',
          sentAt: SENT_AT,
        }),
        buildSettlement({
          deliveryId: 'delivery-second',
          providerMessageId: 'provider-second',
          sentAt: SENT_AT,
        }),
      ],
    });

    expect(parameters[0]).toEqual(['delivery-first', 'delivery-second']);
    expect(parameters[4]).toEqual(['provider-first', 'provider-second']);
  });

  it('scopes the update to the workspace and the claim that is being settled', () => {
    const { sql, parameters } = buildCampaignDeliverySettleQuery({
      workspaceId: 'workspace-1',
      claimToken: 'claim-1',
      settlements: [buildSettlement({ deliveryId: 'delivery-a' })],
    });

    expect(sql).toContain('delivery."workspaceId" = $7');
    expect(sql).toContain('delivery."claimToken" = $8');
    expect(parameters[6]).toBe('workspace-1');
    expect(parameters[7]).toBe('claim-1');
  });

  it('returns the settled ids from a select so the driver reports rows rather than an update tuple', () => {
    const { sql } = buildCampaignDeliverySettleQuery({
      workspaceId: 'workspace-1',
      claimToken: 'claim-1',
      settlements: [buildSettlement({ deliveryId: 'delivery-a' })],
    });

    expect(sql.trim().startsWith('WITH settled AS (')).toBe(true);
    expect(sql).toContain('SELECT "id" FROM settled');
  });

  it('advances updatedAt so staleness checks see the settle', () => {
    const { sql } = buildCampaignDeliverySettleQuery({
      workspaceId: 'workspace-1',
      claimToken: 'claim-1',
      settlements: [buildSettlement({ deliveryId: 'delivery-a' })],
    });

    expect(sql).toContain('"updatedAt" = now()');
  });
});
