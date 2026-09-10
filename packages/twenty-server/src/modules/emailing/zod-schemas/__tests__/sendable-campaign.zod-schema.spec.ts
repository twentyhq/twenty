import { MessageCampaignStatus } from 'twenty-shared/types';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';
import { sendableCampaignSchema } from 'src/modules/emailing/zod-schemas/sendable-campaign.zod-schema';

describe('sendableCampaignSchema', () => {
  const sendableCampaign = {
    status: MessageCampaignStatus.DRAFT,
    subject: 'Monthly newsletter',
    bodyTemplate: JSON.stringify({
      type: 'doc',
      attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
      ],
    }),
    fromAddress: { primaryEmail: 'news@company.com' },
    listId: '20202020-0000-4000-8000-000000000001',
  };

  it('should accept a draft campaign with a subject, body, from address and list', () => {
    expect(sendableCampaignSchema.safeParse(sendableCampaign).success).toBe(
      true,
    );
  });

  it('should accept a scheduled campaign so its send can revalidate it', () => {
    expect(
      sendableCampaignSchema.safeParse({
        ...sendableCampaign,
        status: MessageCampaignStatus.SCHEDULED,
      }).success,
    ).toBe(true);
  });

  it('should keep an unscheduled campaign scheduledAt null rather than coercing it to the epoch', () => {
    const parsed = sendableCampaignSchema.safeParse({
      ...sendableCampaign,
      scheduledAt: null,
    });

    expect(parsed.data?.scheduledAt).toBeNull();
  });

  it('should parse the time a scheduled campaign is holding', () => {
    const parsed = sendableCampaignSchema.safeParse({
      ...sendableCampaign,
      status: MessageCampaignStatus.SCHEDULED,
      scheduledAt: '2026-09-07T16:00:00.000Z',
    });

    expect(parsed.data?.scheduledAt).toEqual(
      new Date('2026-09-07T16:00:00.000Z'),
    );
  });

  it('should reject a campaign that already went out', () => {
    expect(
      sendableCampaignSchema.safeParse({
        ...sendableCampaign,
        status: MessageCampaignStatus.SENT,
      }).success,
    ).toBe(false);
  });

  it('should reject a draft without a subject', () => {
    expect(
      sendableCampaignSchema.safeParse({
        ...sendableCampaign,
        subject: '',
      }).success,
    ).toBe(false);
  });

  it('should reject a draft without a body', () => {
    expect(
      sendableCampaignSchema.safeParse({
        ...sendableCampaign,
        bodyTemplate: '',
      }).success,
    ).toBe(false);
  });

  it('should reject a draft with a malformed from address', () => {
    expect(
      sendableCampaignSchema.safeParse({
        ...sendableCampaign,
        fromAddress: { primaryEmail: 'not-an-email' },
      }).success,
    ).toBe(false);
  });

  it('should reject a draft without a from address', () => {
    expect(
      sendableCampaignSchema.safeParse({
        ...sendableCampaign,
        fromAddress: null,
      }).success,
    ).toBe(false);
  });

  it('should reject a draft without a recipient list', () => {
    expect(
      sendableCampaignSchema.safeParse({
        ...sendableCampaign,
        listId: null,
      }).success,
    ).toBe(false);
  });

  it('should accept a body holding a canonical TipTap document', () => {
    expect(
      sendableCampaignSchema.safeParse({
        ...sendableCampaign,
        bodyTemplate: JSON.stringify({
          type: 'doc',
          attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
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

  it('should reject a versionless TipTap document', () => {
    expect(
      sendableCampaignSchema.safeParse({
        ...sendableCampaign,
        bodyTemplate: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Legacy body' }],
            },
          ],
        }),
      }).success,
    ).toBe(false);
  });

  it('should reject a body that is not an email document', () => {
    expect(
      sendableCampaignSchema.safeParse({
        ...sendableCampaign,
        bodyTemplate: '<p>Hello {{firstName}}</p>',
      }).success,
    ).toBe(false);
  });

  it('should reject a body holding JSON that is not a document', () => {
    expect(
      sendableCampaignSchema.safeParse({
        ...sendableCampaign,
        bodyTemplate: JSON.stringify({ type: 'paragraph' }),
      }).success,
    ).toBe(false);
  });

  it('should reject a document with a malformed nested node', () => {
    expect(
      sendableCampaignSchema.safeParse({
        ...sendableCampaign,
        bodyTemplate: JSON.stringify({
          type: 'doc',
          attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
          content: [{ type: 'paragraph', content: [{ text: 'no type' }] }],
        }),
      }).success,
    ).toBe(false);
  });

  it('should accept a document using email blocks', () => {
    expect(
      sendableCampaignSchema.safeParse({
        ...sendableCampaign,
        bodyTemplate: JSON.stringify({
          type: 'doc',
          attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
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
      sendableCampaignSchema.safeParse({
        ...sendableCampaign,
        bodyTemplate: JSON.stringify({
          type: 'doc',
          attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
          content: [{ type: 'countdownTimer', attrs: {} }],
        }),
      }).success,
    ).toBe(false);
  });

  it('should reject a document from a future schema version', () => {
    expect(
      sendableCampaignSchema.safeParse({
        ...sendableCampaign,
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
