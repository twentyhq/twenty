import { MessageCampaignStatus } from 'twenty-shared/types';
import { sendableDraftCampaignSchema } from 'src/modules/emailing/zod-schemas/sendable-draft-campaign.zod-schema';

describe('sendableDraftCampaignSchema', () => {
  const sendableDraftCampaign = {
    status: MessageCampaignStatus.DRAFT,
    subject: 'Monthly newsletter',
    bodyTemplate: '<p>Hello {{firstName}}</p>',
    fromAddress: { primaryEmail: 'news@company.com' },
    listId: '20202020-0000-4000-8000-000000000001',
  };

  it('should accept a draft campaign with a subject, body, from address and list', () => {
    expect(
      sendableDraftCampaignSchema.safeParse(sendableDraftCampaign).success,
    ).toBe(true);
  });

  it('should reject a campaign that already left DRAFT', () => {
    expect(
      sendableDraftCampaignSchema.safeParse({
        ...sendableDraftCampaign,
        status: MessageCampaignStatus.SENT,
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

  it('should reject a draft without a body', () => {
    expect(
      sendableDraftCampaignSchema.safeParse({
        ...sendableDraftCampaign,
        bodyTemplate: '',
      }).success,
    ).toBe(false);
  });

  it('should reject a draft with a malformed from address', () => {
    expect(
      sendableDraftCampaignSchema.safeParse({
        ...sendableDraftCampaign,
        fromAddress: { primaryEmail: 'not-an-email' },
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

  it('should accept a body holding a valid TipTap document', () => {
    expect(
      sendableDraftCampaignSchema.safeParse({
        ...sendableDraftCampaign,
        bodyTemplate: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Hello' }],
            },
          ],
        }),
      }).success,
    ).toBe(true);
  });

  it('should accept a legacy HTML body', () => {
    expect(
      sendableDraftCampaignSchema.safeParse({
        ...sendableDraftCampaign,
        bodyTemplate: '<p>Hello {{firstName}}</p>',
      }).success,
    ).toBe(true);
  });

  it('should reject a body holding JSON that is not a document', () => {
    expect(
      sendableDraftCampaignSchema.safeParse({
        ...sendableDraftCampaign,
        bodyTemplate: JSON.stringify({ type: 'paragraph' }),
      }).success,
    ).toBe(false);
  });

  it('should reject a document with a malformed nested node', () => {
    expect(
      sendableDraftCampaignSchema.safeParse({
        ...sendableDraftCampaign,
        bodyTemplate: JSON.stringify({
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ text: 'no type' }] }],
        }),
      }).success,
    ).toBe(false);
  });

  it('should accept a document using email blocks', () => {
    expect(
      sendableDraftCampaignSchema.safeParse({
        ...sendableDraftCampaign,
        bodyTemplate: JSON.stringify({
          type: 'doc',
          attrs: { schemaVersion: 1 },
          content: [
            {
              type: 'section',
              attrs: { style: { padding: '12px' } },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Hello' }],
                },
              ],
            },
            {
              type: 'button',
              attrs: { href: 'https://example.com', style: {} },
              content: [{ type: 'text', text: 'Open' }],
            },
          ],
        }),
      }).success,
    ).toBe(true);
  });

  it('should reject a document holding an unknown block type', () => {
    expect(
      sendableDraftCampaignSchema.safeParse({
        ...sendableDraftCampaign,
        bodyTemplate: JSON.stringify({
          type: 'doc',
          content: [{ type: 'countdownTimer', attrs: {} }],
        }),
      }).success,
    ).toBe(false);
  });

  it('should reject a document from a future schema version', () => {
    expect(
      sendableDraftCampaignSchema.safeParse({
        ...sendableDraftCampaign,
        bodyTemplate: JSON.stringify({
          type: 'doc',
          attrs: { schemaVersion: 999 },
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] },
          ],
        }),
      }).success,
    ).toBe(false);
  });
});
