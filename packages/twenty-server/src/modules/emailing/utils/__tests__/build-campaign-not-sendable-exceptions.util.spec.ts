import { MessageCampaignStatus } from 'twenty-shared/types';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';

import { EmailingDomainExceptionCode } from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { buildCampaignNotSendableExceptions } from 'src/modules/emailing/utils/build-campaign-not-sendable-exceptions.util';
import { sendableCampaignSchema } from 'src/modules/emailing/zod-schemas/sendable-campaign.zod-schema';

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

const buildExceptionsFor = (campaign: Record<string, unknown>) => {
  const parsed = sendableCampaignSchema.safeParse(campaign);

  return buildCampaignNotSendableExceptions({
    campaignId: 'campaign-1',
    issues: parsed.error?.issues ?? [],
  });
};

describe('buildCampaignNotSendableExceptions', () => {
  it('lists every missing field of an empty draft in the order the user fixes them', () => {
    const exceptions = buildExceptionsFor({
      status: MessageCampaignStatus.DRAFT,
      subject: null,
      bodyTemplate: null,
      fromAddress: null,
      listId: null,
    });

    expect(
      exceptions.map((exception) => exception.userFriendlyMessage.message),
    ).toEqual([
      'Pick a list in the To field first.',
      'Add a sender to this campaign first.',
      'Add a subject to this campaign first.',
      'Write the email content first.',
    ]);
  });

  it('keeps the not sendable code the send path throws', () => {
    const [exception] = buildExceptionsFor({
      ...sendableCampaign,
      subject: '',
    });

    expect(exception.code).toBe(
      EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
    );
    expect(exception.message).toContain(
      'Campaign campaign-1 is not sendable: subject',
    );
  });

  it('reports an empty body once even though it also fails the document check', () => {
    const exceptions = buildExceptionsFor({
      ...sendableCampaign,
      bodyTemplate: '',
    });

    expect(exceptions).toHaveLength(1);
    expect(exceptions[0].userFriendlyMessage.message).toBe(
      'Write the email content first.',
    );
  });

  it('puts an already sent campaign ahead of its content problems', () => {
    const exceptions = buildExceptionsFor({
      ...sendableCampaign,
      status: MessageCampaignStatus.SENT,
      subject: '',
    });

    expect(
      exceptions.map((exception) => exception.userFriendlyMessage.message),
    ).toEqual([
      'Only a draft or scheduled campaign can be sent.',
      'Add a subject to this campaign first.',
    ]);
  });
});
