import { buildCampaignMessageId } from 'src/modules/emailing/utils/build-campaign-message-id.util';

const CAMPAIGN_ID = '9b7c7e0c-6a1e-4f2e-9f3a-2b8d5c1a4e10';
const OTHER_CAMPAIGN_ID = 'd2f4a6b8-1c3e-4a5b-8d7f-0e9c2a4b6d81';
const PERSON_ID = '4a2f8c1d-5b6e-4c7a-9d8e-3f1b0a2c5d64';
const OTHER_PERSON_ID = '7e5d3c1b-9a8f-4e6d-8c7b-5a4f3e2d1c09';

describe('buildCampaignMessageId', () => {
  it('returns the same id for the same campaign and person', () => {
    expect(
      buildCampaignMessageId({ campaignId: CAMPAIGN_ID, personId: PERSON_ID }),
    ).toBe(
      buildCampaignMessageId({ campaignId: CAMPAIGN_ID, personId: PERSON_ID }),
    );
  });

  it('returns a different id for another person in the same campaign', () => {
    expect(
      buildCampaignMessageId({ campaignId: CAMPAIGN_ID, personId: PERSON_ID }),
    ).not.toBe(
      buildCampaignMessageId({
        campaignId: CAMPAIGN_ID,
        personId: OTHER_PERSON_ID,
      }),
    );
  });

  it('returns a different id for the same person in another campaign', () => {
    expect(
      buildCampaignMessageId({ campaignId: CAMPAIGN_ID, personId: PERSON_ID }),
    ).not.toBe(
      buildCampaignMessageId({
        campaignId: OTHER_CAMPAIGN_ID,
        personId: PERSON_ID,
      }),
    );
  });

  it('is stable across calls so a retried materialization reuses the same message rows', () => {
    const ids = Array.from({ length: 5 }, () =>
      buildCampaignMessageId({ campaignId: CAMPAIGN_ID, personId: PERSON_ID }),
    );

    expect(new Set(ids).size).toBe(1);
  });
});
