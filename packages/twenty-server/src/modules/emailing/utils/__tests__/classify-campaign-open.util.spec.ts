import { classifyCampaignOpen } from 'src/modules/emailing/utils/classify-campaign-open.util';

const DESKTOP_MAIL_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko)';

const SENT_AT = new Date('2026-09-23T12:00:00.000Z');

describe('classifyCampaignOpen', () => {
  it('leaves a later open by a mail client unclassified', () => {
    expect(
      classifyCampaignOpen({
        sentAt: SENT_AT,
        occurredAt: '2026-09-23T13:00:00.000Z',
        userAgent: DESKTOP_MAIL_USER_AGENT,
      }),
    ).toBe('UNCLASSIFIED');
  });

  it('flags an open fetched seconds after sending as automation', () => {
    expect(
      classifyCampaignOpen({
        sentAt: SENT_AT,
        occurredAt: '2026-09-23T12:00:03.000Z',
        userAgent: DESKTOP_MAIL_USER_AGENT,
      }),
    ).toBe('SUSPECTED_AUTOMATION');
  });

  it('keeps the Apple Mail privacy prefetch apart from scanners, even right after sending', () => {
    expect(
      classifyCampaignOpen({
        sentAt: SENT_AT,
        occurredAt: '2026-09-23T12:00:03.000Z',
        userAgent: 'Mozilla/5.0',
      }),
    ).toBe('PRIVACY_PROXY');
  });

  it('flags a known security scanner whenever it fetches the pixel', () => {
    expect(
      classifyCampaignOpen({
        sentAt: SENT_AT,
        occurredAt: '2026-09-24T12:00:00.000Z',
        userAgent: 'Mozilla/5.0 (compatible; Barracuda Sentinel)',
      }),
    ).toBe('SUSPECTED_AUTOMATION');
  });

  it('falls back to the user agent when the send time is unknown', () => {
    expect(
      classifyCampaignOpen({
        sentAt: null,
        occurredAt: '2026-09-23T12:00:03.000Z',
        userAgent: DESKTOP_MAIL_USER_AGENT,
      }),
    ).toBe('UNCLASSIFIED');
  });
});
