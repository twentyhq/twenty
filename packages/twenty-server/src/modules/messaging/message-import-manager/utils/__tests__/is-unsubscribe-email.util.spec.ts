import { isUnsubscribeEmail } from 'src/modules/messaging/message-import-manager/utils/is-unsubscribe-email.util';

describe('isUnsubscribeEmail', () => {
  it.each([
    '32.MRTVISTNM5XUEQKONZGTO6K7LF5E6ODWIFNGY6STG53FGMKBGVXDMU3TGZGHAUJSN5IT2PI=@unsubscribe2.customer.io',
    'unsubscribe@mail.vendor.com',
    'newsletter-unsubscribe@lists.acme.com',
    'u-unsub-6d81f0@bounce.vendor.com',
    'optout@sendgrid.net',
    'opt-out@mailer.acme.com',
    'bounce-123@unsubscribe.mailer.co.uk',
  ])('should recognise %s as an unsubscribe mailbox', (email) => {
    expect(isUnsubscribeEmail(email)).toBe(true);
  });

  it.each([
    'jane@unsubtle.com',
    'optometry@acme.com',
    'opt-outreach@acme.com',
    'optoutlet@acme.com',
    'unsubscribers-are-us@acme.com',
    'contact@unsubscribe-tools.com',
    'reply@unsubscribe-software.com',
    'jane@optoutdrive.com',
    'user@unsubscribe.co.uk',
    'support@acme.com',
    'john.doe@acme.com',
  ])('should not mistake %s for an unsubscribe mailbox', (email) => {
    expect(isUnsubscribeEmail(email)).toBe(false);
  });
});
