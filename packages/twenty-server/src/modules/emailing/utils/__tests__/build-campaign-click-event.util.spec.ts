import { type CampaignEngagementObservation } from 'src/modules/emailing/types/campaign-engagement-observation.type';
import { buildCampaignClickEvent } from 'src/modules/emailing/utils/build-campaign-click-event.util';

const DELIVERY = {
  id: '7b1b78df-f57c-4367-88ba-31b41e38ab91',
  workspaceId: '4fe04fe4-dcd6-4123-bf05-ec8f989cda29',
  campaignId: '81110623-55f6-4dae-becd-1944d4d88078',
};
const OBSERVATION: CampaignEngagementObservation = {
  eventId: 'b55db0be-cd10-4802-b332-0cb3e81a02c8',
  occurredAt: '2026-09-23T12:00:00.000Z',
  deliveryId: DELIVERY.id,
  shortLinkId: 'e589543a-287d-4a83-ae31-55f9ef6c1cb3',
  userAgent: null,
};

describe('buildCampaignClickEvent', () => {
  it('does not create an event when tracking is disabled', () => {
    expect(
      buildCampaignClickEvent({
        delivery: DELIVERY,
        workspace: { isCampaignClickTrackingEnabled: false },
        observation: OBSERVATION,
      }),
    ).toBeNull();
  });

  it('uses the delivery ownership and preserves the observation event ID', () => {
    const event = buildCampaignClickEvent({
      delivery: DELIVERY,
      workspace: { isCampaignClickTrackingEnabled: true },
      observation: OBSERVATION,
    });

    expect(event).toEqual({
      workspaceId: DELIVERY.workspaceId,
      messageCampaignId: DELIVERY.campaignId,
      deliveryId: DELIVERY.id,
      shortLinkId: OBSERVATION.shortLinkId,
      eventId: OBSERVATION.eventId,
      occurredAt: OBSERVATION.occurredAt,
      activityClass: 'UNCLASSIFIED',
    });
    expect(
      buildCampaignClickEvent({
        delivery: DELIVERY,
        workspace: { isCampaignClickTrackingEnabled: true },
        observation: OBSERVATION,
      })?.eventId,
    ).toBe(OBSERVATION.eventId);
  });
});
