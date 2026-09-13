import { extractMessageTextWithoutQuotedHistory } from 'src/modules/messaging/message-import-manager/utils/extract-message-text-without-quoted-history.util';

type QuoteFreeEmail = {
  name: string;
  body: string;
};

const QUOTE_FREE_EMAILS: QuoteFreeEmail[] = [
  {
    name: 'quarantine digest whose details table carries a Date label',
    body: [
      '[Contoso Security]<https://example.com/portal>',
      '',
      'Review these messages',
      '1 message has been held for you to review as of 12/02/2025 5:21:50 AM (UTC).',
      'Please review within 30 days or the message will be deleted from the quarantine portal<https://example.com/quarantine> in the security centre.',
      'Message list details',
      'Sender:         alerts@contoso-mail.example.com',
      'Subject:        Quarterly compliance summary for your review',
      '',
      'Date:   12/02/2025 5:06:49 AM',
      'Manage settings <https://example.com/settings>                Support <https://example.com/support>',
      '',
      '© 2025 Contoso Corporation. All rights reserved.',
      'Privacy Statement<https://example.com/privacy>',
      'Contact Us<https://example.com/contact>',
    ].join('\n'),
  },
  {
    name: 'event details form whose labels look like quote headers',
    body: [
      'Hi,',
      '',
      'Date: March 3',
      'Location: HQ, second floor',
      'Contact: bob@acme.example.com',
      '',
      'See you there',
    ].join('\n'),
  },
  {
    name: 'sentence that opens with on and mentions something sent',
    body: [
      'Hi Bob,',
      '',
      'on second thought here is what I sent:',
      '1. the signed contract',
      '2. the revised invoice',
      '',
      'Thanks',
    ].join('\n'),
  },
  {
    name: 'line that opens with a date and mentions an address',
    body: [
      'Thanks,',
      '',
      '15.01.2025 - invoice sent to billing@acme.example.com',
      'Please confirm receipt.',
    ].join('\n'),
  },
];

describe('emails that carry no quoted history', () => {
  describe.each(QUOTE_FREE_EMAILS.map((email) => [email.name, email] as const))(
    '%s',
    (_name, email) => {
      it('should survive the pipeline untouched', () => {
        expect(
          extractMessageTextWithoutQuotedHistory({ text: email.body }),
        ).toBe(email.body);
      });
    },
  );

  it('should still cut a details table once it names a participant', () => {
    const withParticipant = [
      'Review these messages',
      '',
      'From:   alerts@contoso-mail.example.com',
      'Date:   12/02/2025 5:06:49 AM',
      'Subject: Quarterly compliance summary',
    ].join('\n');

    expect(
      extractMessageTextWithoutQuotedHistory({ text: withParticipant }),
    ).toBe('Review these messages');
  });
});
