import { CAMPAIGN_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { sendableDraftCampaignSchema } from 'src/modules/emailing/zod-schemas/sendable-draft-campaign.zod-schema';

describe('sendableDraftCampaignSchema', () => {
  const sendableDraftCampaign = {
    status: CAMPAIGN_STATUS.DRAFT,
    subject: 'Monthly newsletter',
    fromAddress: { primaryEmail: 'news@company.com' },
    listId: '20202020-0000-4000-8000-000000000001',
  };

  it('should accept a draft campaign with a subject, from address and list', () => {
    expect(
      sendableDraftCampaignSchema.safeParse(sendableDraftCampaign).success,
    ).toBe(true);
  });

  it('should reject a campaign that already left DRAFT', () => {
    expect(
      sendableDraftCampaignSchema.safeParse({
        ...sendableDraftCampaign,
        status: CAMPAIGN_STATUS.SENT,
      }).success,
    ).toBe(false);
  });

  it('should reject a draft without a subject', () => {
    expect(
      sendableDraftCampaignSchema.safeParse({
        ...sendableDraftCampaign,
        subject: '',
      }).success,
    ).toBe(false);
  });

  it('should reject a draft without a from address', () => {
    expect(
      sendableDraftCampaignSchema.safeParse({
        ...sendableDraftCampaign,
        fromAddress: null,
      }).success,
    ).toBe(false);
  });

  it('should reject a draft without a recipient list', () => {
    expect(
      sendableDraftCampaignSchema.safeParse({
        ...sendableDraftCampaign,
        listId: null,
      }).success,
    ).toBe(false);
  });
});
