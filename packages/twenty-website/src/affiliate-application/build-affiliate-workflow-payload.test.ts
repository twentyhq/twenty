import { buildAffiliateWorkflowPayload } from './build-affiliate-workflow-payload';

const BASE_REQUEST = {
  name: 'Ada Lovelace',
  email: 'Ada@Example.com',
  partnerType: 'CONTENT_CREATOR',
  acceptsTerms: true,
} as const;

describe('buildAffiliateWorkflowPayload', () => {
  it('sends every key, with blanks for the optional fields left empty', () => {
    const payload = buildAffiliateWorkflowPayload(BASE_REQUEST);

    expect(payload).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      partnerType: 'CONTENT_CREATOR',
      mainChannelUrl: '',
      audienceSize: '',
      country: '',
      promotionPlan: '',
      isIntegrationPartner: false,
    });
  });

  it('flags an existing integration partner', () => {
    const payload = buildAffiliateWorkflowPayload({
      ...BASE_REQUEST,
      isIntegrationPartner: true,
    });

    expect(payload.isIntegrationPartner).toBe(true);
  });

  it('carries the filled optional fields through', () => {
    const payload = buildAffiliateWorkflowPayload({
      ...BASE_REQUEST,
      mainChannel: 'https://youtube.com/@ada',
      audienceSize: '12k subscribers',
      country: 'France',
      promotionPlan: 'Monthly CRM teardown videos.',
    });

    expect(payload).toMatchObject({
      mainChannelUrl: 'https://youtube.com/@ada',
      audienceSize: '12k subscribers',
      country: 'France',
      promotionPlan: 'Monthly CRM teardown videos.',
    });
  });
});
